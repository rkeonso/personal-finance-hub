import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/auth', authRoutes);

app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'personal-finance-api' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});