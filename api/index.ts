import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from 'http';
import express from 'express';

// Import the main app setup
const app = express();

// This is a wrapper for Vercel serverless functions
// The actual app is built and served from dist/
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Redirect to the main application
    // Vercel will serve the built static files from dist/public
    // and route API calls through this handler
    res.status(200).json({
        message: 'Ibookee API is running',
        timestamp: new Date().toISOString()
    });
}
