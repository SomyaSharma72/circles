import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import requestRoutes from './routes/requestRoutes.js';
import skillRoutes from './routes/skillRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Neighborly Backend Running'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Neighborly Backend Running'
  });
});

// API Routes
app.use('/api/requests', requestRoutes);
app.use('/api/skills', skillRoutes);

// 404 Handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

export default app;
