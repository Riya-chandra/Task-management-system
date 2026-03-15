// ============================================================
// TaskFlow API — Entry Point
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;


app.use(helmet());                    
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,                  
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────────────────
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,          // 15 minutes
//   max: 20,                            // 20 requests per window
//   message: { success: false, message: 'Too many requests, please try again later.' },
// });

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});


app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'TaskFlow API is running', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/tasks', apiLimiter, taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n TaskFlow API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health:      http://localhost:${PORT}/health\n`);
});

export default app;
