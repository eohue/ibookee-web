import type { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { isAuthenticated } from "../replit_integrations/auth";

// Ensure attached_assets directory exists
const uploadDir = path.resolve(process.cwd(), "attached_assets");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only image files are allowed!"));
    },
});

import sharp from "sharp";

export function registerUploadRoutes(app: Express) {
    // Serve uploaded files statically
    app.use("/assets", express.static(uploadDir));

    app.post("/api/upload", isAuthenticated, upload.single("image"), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            // Generate unique filename
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            // We'll normalize everything to webp or keep original extension if preferred.
            // Let's stick to original extension unless it's huge, but sharp is good at optimizing.
            // For simplicity and consistency, let's output webp for efficiency or keep jpg/png.
            // Let's respect input type but optimize.

            const originalExt = path.extname(req.file.originalname).toLowerCase();
            let ext = originalExt;
            if (ext === '.jpeg') ext = '.jpg';

            const filename = req.file.fieldname + "-" + uniqueSuffix + ext;
            const filepath = path.join(uploadDir, filename);

            // Process image
            let pipeline = sharp(req.file.buffer);

            // Get metadata to check width
            const metadata = await pipeline.metadata();

            if (metadata.width && metadata.width > 2560) {
                pipeline = pipeline.resize(2560, null, { withoutEnlargement: true });
            }

            // Optimization based on format
            // We just save it to buffer then write to file, or write directly
            await pipeline
                .withMetadata() // Preserve metadata like orientation
                .toFile(filepath);

            const fileUrl = `/assets/${filename}`;
            res.json({ url: fileUrl });
        } catch (error: any) {
            console.error("Upload error:", error);
            res.status(500).json({ error: error.message });
        }
    });
}

import express from "express";
