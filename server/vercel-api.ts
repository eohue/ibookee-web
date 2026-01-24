// Vercel Serverless API Handler
// This file is the entry point for Vercel serverless functions
// It wraps the Express app and handles initialization

import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import { serveStatic } from './static';
import { createServer } from 'http';
import { db } from './db';
import { sql } from 'drizzle-orm';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();
const httpServer = createServer(app);

// Request body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.path.startsWith('/api')) {
            console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
        }
    });
    next();
});

// Initialization state
let initialized = false;
let initPromise: Promise<void> | null = null;

async function initialize() {
    if (initialized) return;

    console.log('Initializing Vercel serverless function...');

    // Run database migrations
    if (process.env.DATABASE_URL) {
        try {
            await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' NOT NULL`);
            console.log('Database migration successful.');
        } catch (err) {
            console.error('Migration error:', err);
        }
    }

    // Register all routes
    await registerRoutes(httpServer, app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || 'Internal Server Error';
        console.error('Error:', err);
        res.status(status).json({ message });
    });

    // Serve static files - DISABLED for Vercel Serverless
    // Vercel handles static files via output configuration
    // serveStatic(app);

    initialized = true;
    console.log('Vercel serverless function initialized successfully.');
}

// Export the Vercel handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        console.log(`[Handler] Received ${req.method} ${req.url}`);

        // Lazy initialization on first request
        if (!initPromise) {
            console.log("[Handler] Triggering initialization...");
            initPromise = initialize().catch(err => {
                console.error("[Handler] Initialization failed:", err);
                initPromise = null;
                throw err;
            });
        }
        await initPromise;

        // Handle request with Express app
        return new Promise<void>((resolve) => {
            app(req as any, res as any);
            res.on('finish', resolve);
            res.on('close', resolve);
        });
    } catch (err: any) {
        console.error("[Handler] Critical Error:", err);

        // Ensure response wasn't already sent
        if (!res.headersSent) {
            // Use native methods to avoid "res.status is not a function" error
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: "Internal Server Error",
                message: err.message,
                details: "Check Vercel Runtime Logs for full stack trace"
            }));
        }
    }
}
