#!/usr/bin/env node

/**
 * Revolutionary Codegen WebUI Entry Point
 * Next.js application with tree navigation, Monaco editor, and runbook generation
 * AGENTS.md compliant: WebUI entry point with required features
 */

import { createServer } from 'http';
import next from 'next';
import { parse } from 'url';

// WebUI configuration
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url!, true);

      // Handle API routes
      if (parsedUrl.pathname?.startsWith('/api/')) {
        await handle(req, res, parsedUrl);
        return;
      }

      // Handle static files
      if (parsedUrl.pathname?.startsWith('/_next/') ||
          parsedUrl.pathname?.startsWith('/static/') ||
          parsedUrl.pathname?.includes('.')) {
        await handle(req, res, parsedUrl);
        return;
      }

      // Default to index page
      await app.render(req, res, '/', parsedUrl.query);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, () => {
    console.log(`🚀 Revolutionary Codegen WebUI ready at http://${hostname}:${port}`);
    console.log(`📊 Tree navigation and Monaco editor enabled`);
    console.log(`🔍 Full-text search and filtering active`);
    console.log(`📋 Runbook generation ready`);
  });
}).catch((ex) => {
  console.error('Failed to start WebUI:', ex);
  process.exit(1);
});
