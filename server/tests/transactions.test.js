import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

// 1. Mock Prisma models for transactions
vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

// 2. MOCK AUTHENTICATION MIDDLEWARE GLOBALLY FOR TESTING
vi.mock('../src/middleware/auth.js', () => ({
  requireAuth: (req, res, next) => {
    // Inject a dummy authenticated user object into the request lifecycle
    req.user = { userId: 'mock-user-123' };
    next();
  },
}));

describe('Personal Finance API - Transactions & CSV Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/transactions', () => {
    it('returns 200 and a list of transactions', async () => {
      const mockRecords = [
        { id: 'tx_1', amount: 45.5, category: 'Groceries', date: '2026-10-15', userId: 'mock-user-123' },
        { id: 'tx_2', amount: 12.0, category: 'Dining', date: '2026-10-16', userId: 'mock-user-123' },
      ];

      prisma.transaction.findMany.mockResolvedValueOnce(mockRecords);

      const res = await request(app)
        .get('/api/transactions')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(prisma.transaction.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/transactions/upload-csv', () => { 
    it('returns 400 if no file is attached in the request', async () => {
      const res = await request(app)
        .post('/api/transactions/upload-csv') 
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('parses CSV content and calls prisma.createMany successfully', async () => {
      const rawCsvString = [
        'date,merchant,amount,category',
        '2026-10-10,Target,54.22,Shopping',
        '2026-10-12,Trader Joes,31.10,Groceries',
      ].join('\n');

      prisma.transaction.createMany.mockResolvedValueOnce({ count: 2 });

      const res = await request(app)
        .post('/api/transactions/upload-csv') 
        .attach('file', Buffer.from(rawCsvString), 'statement.csv')
        .expect(201); 

      expect(res.body).toHaveProperty('count', 2);
      expect(prisma.transaction.createMany).toHaveBeenCalledTimes(1);
    });
  });
});
