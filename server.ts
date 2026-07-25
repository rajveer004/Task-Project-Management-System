import 'dotenv/config';
import dns from 'node:dns';
// Force Node to use Google and Cloudflare DNS to resolve MongoDB Atlas SRV records properly
dns.setServers(['1.1.1.1', '8.8.8.8']);
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { connectMongoDB } from './server/models/mongoSchemas.js';
import { authMiddleware } from './server/auth.js';
import { authRouter } from './server/routes/authRoutes.js';
import { boardRouter } from './server/routes/boardRoutes.js';
import { taskRouter } from './server/routes/taskRoutes.js';
import { aiRouter } from './server/routes/aiRoutes.js';
import { analyticsRouter } from './server/routes/analyticsRoutes.js';
import { automationRouter } from './server/routes/automationRoutes.js';
import { auditRouter } from './server/routes/auditRoutes.js';
import { matchmakingRouter } from './server/routes/matchmakingRoutes.js';
import { chatRouter } from './server/routes/chatRoutes.js';
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  // Initialize MongoDB model driver connection
  await connectMongoDB().catch(err => console.warn('MongoDB connection note:', err.message));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  // Global Auth context setup
  app.use(authMiddleware);
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'SubPilot Task Enterprise API' });
  });
  // Server-Sent Events (SSE) Real-Time Live Sync Endpoint
  app.get('/api/realtime/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`data: ${JSON.stringify({ event: 'connected', message: 'SubPilot Live Stream Active' })}\n\n`);
    const unsubscribe = db.subscribe((data) => {
      res.write(`data: ${data}\n\n`);
    });
    req.on('close', () => {
      unsubscribe();
    });
  });
  // Mount API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/boards', boardRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/automations', automationRouter);
  app.use('/api/security', auditRouter);
  app.use('/api/matchmaking', matchmakingRouter);
  app.use('/api/chat', chatRouter);
  // Vite Middleware for Development vs Production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: process.env.HMR_PORT ? parseInt(process.env.HMR_PORT, 10) : 24679
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SubPilot Task] Full-Stack Enterprise Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch(err => {
  console.error('Failed to start server:', err);
});
