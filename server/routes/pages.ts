import type { Express } from "express";
import { storage } from "../storage";
import { insertEditablePageSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerPageRoutes(app: Express) {
    // Public page endpoint
    app.get("/api/pages/:slug", async (req, res) => {
        try {
            const page = await storage.getEditablePage(req.params.slug);
            if (!page) {
                return res.status(404).json({ error: "Page not found" });
            }
            res.json(page);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch page" });
        }
    });

    // Public page images endpoint
    app.get("/api/page-images", async (_req, res) => {
        try {
            const images = await storage.getPageImages();
            res.json(images);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch page images" });
        }
    });

    app.get("/api/page-images/:pageKey", async (req, res) => {
        try {
            const images = await storage.getPageImagesByPage(req.params.pageKey);
            res.json(images);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch page images" });
        }
    });

    // Admin Editable Pages CRUD
    app.get("/api/admin/pages", isAuthenticated, async (_req, res) => {
        try {
            const pages = await storage.getEditablePages();
            res.json(pages);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch pages" });
        }
    });

    app.get("/api/admin/pages/:slug", isAuthenticated, async (req, res) => {
        try {
            const page = await storage.getEditablePage(req.params.slug);
            if (!page) {
                return res.status(404).json({ error: "Page not found" });
            }
            res.json(page);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch page" });
        }
    });

    app.put("/api/admin/pages/:slug", isAuthenticated, async (req, res) => {
        try {
            const parsed = insertEditablePageSchema.safeParse({ ...req.body, slug: req.params.slug });
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid page data", details: parsed.error });
            }
            const page = await storage.upsertEditablePage(parsed.data);
            res.json(page);
        } catch (error) {
            res.status(500).json({ error: "Failed to update page" });
        }
    });

    // Admin Page Images CRUD
    app.get("/api/admin/page-images", isAuthenticated, async (_req, res) => {
        try {
            const images = await storage.getPageImages();
            res.json(images);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch page images" });
        }
    });

    app.get("/api/admin/page-images/:pageKey", isAuthenticated, async (req, res) => {
        try {
            const images = await storage.getPageImagesByPage(req.params.pageKey);
            res.json(images);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch page images" });
        }
    });

    app.put("/api/admin/page-images", isAuthenticated, async (req, res) => {
        try {
            const image = await storage.upsertPageImage(req.body);
            res.json(image);
        } catch (error) {
            res.status(500).json({ error: "Failed to save page image" });
        }
    });

    app.put("/api/admin/page-images-list", isAuthenticated, async (req, res) => {
        try {
            const { pageKey, imageKey, images } = req.body;
            if (!pageKey || !imageKey || !Array.isArray(images)) {
                return res.status(400).json({ error: "Invalid request body" });
            }

            // Validate and prepare images
            const imageRecords = images.map((img: any, index: number) => ({
                pageKey,
                imageKey,
                imageUrl: img.imageUrl,
                altText: img.altText,
                displayOrder: index
            }));

            const result = await storage.replacePageImages(pageKey, imageKey, imageRecords);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to replace page images" });
        }
    });

    app.delete("/api/admin/page-images/:id", isAuthenticated, async (req, res) => {
        try {
            await storage.deletePageImage(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete page image" });
        }
    });
}
