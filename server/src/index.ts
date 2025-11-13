import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { prisma } from './config/database';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import geminiRoutes from './routes/gemini.routes';
import stylesRoutes from './routes/styles.routes';
import collectionsRoutes from './routes/collections.routes';
import usersRoutes from './routes/users.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Health check endpoint with database verification
app.get('/health', async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown' as 'ok' | 'error' | 'unknown',
  };

  try {
    // Verify database connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'ok';
    res.json(health);
  } catch (error) {
    health.status = 'degraded';
    health.database = 'error';
    res.status(503).json(health);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/styles', stylesRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/users', usersRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`
╔══════════════════════════════════════════╗
║  Midjourney Style Library - Backend API ║
╚══════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📡 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}
🔐 JWT Secret: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Not set (using fallback)'}
🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✓ Configured' : '✗ Not configured'}

📚 API Endpoints:
   - GET    /health
   - POST   /api/auth/register
   - POST   /api/auth/login
   - GET    /api/auth/me
   - POST   /api/gemini/parse-prompt
   - GET    /api/styles
   - POST   /api/styles
   - GET    /api/users/leaderboard
   - GET    /api/collections
   - POST   /api/collections

Ready to accept connections! 🎉
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
