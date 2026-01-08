import type { Express } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import https from "https";
import http from "http";

export function registerMetadataRoutes(app: Express) {
    app.post("/api/admin/extract-metadata", isAuthenticated, async (req, res) => {
        try {
            const { url } = req.body;
            if (!url) {
                return res.status(400).json({ error: "URL is required" });
            }

            // Simple validation
            try {
                new URL(url);
            } catch (e) {
                return res.status(400).json({ error: "Invalid URL" });
            }

            const data = await fetchUrlContent(url);

            // Extract OG tags
            const imageUrl = extractMetaTag(data, "og:image");
            const title = extractMetaTag(data, "og:title");
            const description = extractMetaTag(data, "og:description");

            res.json({
                imageUrl: imageUrl || null,
                title: title || null,
                description: description || null
            });

        } catch (error) {
            console.error("Metadata extraction error:", error);
            res.status(500).json({ error: "Failed to extract metadata" });
        }
    });
}

function fetchUrlContent(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? https : http;
        const request = client.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; IbookeeBot/1.0; +http://ibookee.kr)"
            }
        }, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                resolve(data);
            });
        });

        request.on("error", (err) => {
            reject(err);
        });
    });
}

function extractMetaTag(html: string, property: string): string | null {
    const regex = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i");
    const match = html.match(regex);
    return match ? match[1] : null;
}
