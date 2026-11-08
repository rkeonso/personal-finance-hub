import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Must match your Vite origin exactly
    credentials: true, // Required for httpOnly cookies
  })
);

app.use(express.json());

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount your route handlers
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/transactions', transactionRoutes);

export default app;