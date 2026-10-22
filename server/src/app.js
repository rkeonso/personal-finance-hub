// server/src/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import your existing routes here
// import authRoutes from './routes/auth.js';
// import transactionRoutes from './routes/transactions.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

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