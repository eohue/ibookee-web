import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/static';
import { createServer } from 'http';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const app = express();
const httpServer = createServer(app);

// Body parsing middleware
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

    console.log('Initializing serverless function...');

    // Run migrations
    if (process.env.DATABASE_URL) {
        try {
            await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' NOT NULL`);
            console.log('Migration successful.');
        } catch (err) {
            console.error('Migration error:', err);
        }
    }

    // Register routes
    await registerRoutes(httpServer, app);

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || 'Internal Server Error';
        console.error('Error:', err);
        res.status(status).json({ message });
    });

    // Serve static files in production
    serveStatic(app);

    initialized = true;
    console.log('Serverless function initialized.');
}

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Lazy initialization
    if (!initPromise) {
        initPromise = initialize();
    }
    await initPromise;

    // Handle the request with Express
    return new Promise<void>((resolve) => {
        app(req as any, res as any);
        res.on('finish', resolve);
        res.on('close', resolve);
    });
}
