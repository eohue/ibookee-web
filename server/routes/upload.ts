import type { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { isAuthenticated } from "../replit_integrations/auth";
import { uploadToS3, isS3Configured } from "../s3";

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
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only image and PDF files are allowed!"));
    },
});

// Removed top-level sharp import to make it optional

export function setupStaticAssets(app: Express) {
    // Serve uploaded files statically - Bypass auth for performance
    app.use("/assets", express.static(uploadDir));
}

export function registerUploadRoutes(app: Express) {
    // Fallback: Ensure static assets are served if setupStaticAssets wasn't called manually
    // (Express allows multiple static middlewares for same path, but we want to optimize)
    // We will rely on server/routes.ts calling setupStaticAssets first.

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

            // Only optimize images if sharp is available
            if (req.file.mimetype.startsWith('image/')) {
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

            if (isS3Configured()) {
                fileUrl = await uploadToS3(buffer, filename, req.file.mimetype);
            } else {
                console.warn("S3 not configured, falling back to local storage. Files will be ephemeral.");
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

import express from "express";
