import express from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB, checkDBHealth } from './src/server/config/db';
import { initSocket } from './src/server/sockets/socketHandler';

import authRoutes from './src/server/routes/authRoutes';
import requestRoutes from './src/server/routes/requestRoutes';
import skillRoutes from './src/server/routes/skillRoutes';
import reviewRoutes from './src/server/routes/reviewRoutes';
import messageRoutes from './src/server/routes/messageRoutes';
import leaderboardRoutes from './src/server/routes/leaderboardRoutes';
import groupRoutes from './src/server/routes/groupRoutes';

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Connect MongoDB
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB on startup:', err);
  }

  // Initialize Socket.io on same HTTP server
  initSocket(server, process.env.CLIENT_URL || '*');

  // API Health Check Endpoint
  app.get('/api/health', (req, res) => {
    const dbHealth = checkDBHealth();
    res.json({
      status: dbHealth.status === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // API Route Mounting
  app.use('/api/auth', authRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/circles', groupRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);

  // Serve Frontend via Vite Middleware or Production Static Assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Neighborly Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
