import type { Express } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { isAuthenticated, isAdmin } from "../replit_integrations/auth";
import { uploadToStorage, isStorageConfigured } from "../storage_provider";

// Configure upload directory
export let uploadDir = path.resolve(process.cwd(), "attached_assets");

// Try to create the directory, fallback to /tmp if read-only filesystem
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (error) {
    console.warn("Failed to create upload directory in CWD (likely read-only), falling back to /tmp");
    uploadDir = path.resolve("/tmp", "attached_assets");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
}

// Configure storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf/;
        // Case insensitive regex for mime type check
        const allowedMimeTypes = /image\/(jpeg|png|gif|webp|svg\+xml)|application\/pdf/;

        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedMimeTypes.test(file.mimetype);

        if (extname) {
            return cb(null, true);
        }

        cb(new Error("Only image and PDF files are allowed!"));
    },
});

export function setupStaticAssets(app: Express) {
    // Serve uploaded files statically - Bypass auth for performance
    app.use("/assets", express.static(uploadDir));

    // CRITICAL: If asset is not found, return 404 IMMEDIATELY.
    // Do NOT let it fall through to valid auth/session middleware, 
    // which would trigger a DB connection and cause "MaxClients" errors.
    app.use("/assets", (_req, res) => {
        res.status(404).send("Not Found");
    });
}

export function registerUploadRoutes(app: Express) {
    app.post("/api/upload", isAuthenticated, upload.single("image"), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            // Generate unique filename
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

            // Default extension
            const originalExt = path.extname(req.file.originalname).toLowerCase();
            let ext = originalExt;
            if (ext === '.jpeg') ext = '.jpg';

            let buffer = req.file.buffer;

            // Only optimize images if sharp is available (skip for SVG)
            if (req.file.mimetype.startsWith('image/') && !req.file.mimetype.includes('svg')) {
                try {
                    // Dynamic import for sharp
                    const sharpModule = await import("sharp");
                    const sharp = sharpModule.default || sharpModule;

                    // Process image
                    let pipeline = sharp(req.file.buffer);

                    // Get metadata to check width
                    const metadata = await pipeline.metadata();

                    if (metadata.width && metadata.width > 2560) {
                        pipeline = pipeline.resize(2560, null, { withoutEnlargement: true });
                    }

                    // Optimization: Convert to WebP, quality 80%
                    pipeline = pipeline.webp({ quality: 80 });

                    buffer = await pipeline.toBuffer();

                    // Update extension to webp
                    ext = '.webp';
                    req.file.mimetype = 'image/webp';
                } catch (e) {
                    console.warn("Sharp optimization failed or module not found, using original file:", e);
                }
            }

            const filename = req.file.fieldname + "-" + uniqueSuffix + ext;
            const filepath = path.join(uploadDir, filename);

            let fileUrl: string;

            if (isStorageConfigured()) {
                fileUrl = await uploadToStorage(buffer, filename, req.file.mimetype);
            } else {
                console.warn("No persistent storage configured (S3/Supabase), falling back to ephemeral local storage.");
                await fs.promises.writeFile(filepath, buffer);
                fileUrl = `/assets/${filename}`;
            }
            res.json({ url: fileUrl });
        } catch (error: any) {
            console.error("Upload error:", error);
            res.status(500).json({ error: error.message });
        }
    });
}
