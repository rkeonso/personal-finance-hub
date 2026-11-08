import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prismaClient.js'; 

// Mock authentication middleware globally for testing
vi.mock('../src/middleware/auth.js', () => ({
  requireAuth: (req, res, next) => {
    req.user = { userId: 'mock-user-123' };
    next();
  },
}));

describe('Personal Finance API - Transactions & CSV Upload', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Resets spies between runs
  });

  describe('GET /api/transactions', () => {
    it('returns 200 and a list of transactions', async () => {
      const mockRecords = [
        { id: 'tx_1', amount: 45.5, category: 'Groceries', date: '2026-10-15', userId: 'mock-user-123' },
        { id: 'tx_2', amount: 12.0, category: 'Dining', date: '2026-10-16', userId: 'mock-user-123' },
      ];

      // 2. Use vi.spyOn on the default-imported prisma instance
      const findManySpy = vi.spyOn(prisma.transaction, 'findMany').mockResolvedValue(mockRecords);

      const res = await request(app)
        .get('/api/transactions')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(findManySpy).toHaveBeenCalledTimes(1);
    });

  it('returns 500 when database fails to fetch transactions', async () => {
    vi.spyOn(prisma.transaction, 'findMany').mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app)
      .get('/api/transactions')
      .expect(500);

    expect(res.body).toEqual({ error: 'Failed to retrieve transactions' });
  });
});

describe('GET /api/transactions/monthly-summary', () => {
  it('returns 200 with calculated income and expense using explicit year query', async () => {
    const mockTxs = [
      { date: '2026-03-10', amount: 3000, type: 'INCOME' },
      { date: '2026-03-15', amount: 500, type: 'EXPENSE' },
      { date: '2026-07-20', amount: 150, type: 'EXPENSE' },
    ];

    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValue(mockTxs);

    const res = await request(app)
      .get('/api/transactions/monthly-summary?year=2026')
      .expect(200);

    expect(res.body).toHaveLength(12);
    // Month indices: March = 2, July = 6
    expect(res.body[2]).toMatchObject({ month: 3, income: 3000, expense: 500 });
    expect(res.body[6]).toMatchObject({ month: 7, income: 0, expense: 150 });
  });

  it('defaults to current year when year query param is omitted', async () => {
    const findManySpy = vi.spyOn(prisma.transaction, 'findMany').mockResolvedValue([]);

    await request(app)
      .get('/api/transactions/monthly-summary')
      .expect(200);

    const currentYear = new Date().getFullYear();
    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31`),
          },
        }),
      })
    );
  });

  it('returns 500 when calculating monthly summary fails', async () => {
    vi.spyOn(prisma.transaction, 'findMany').mockRejectedValue(new Error('Summary DB Error'));

    const res = await request(app)
      .get('/api/transactions/monthly-summary')
      .expect(500);

    expect(res.body).toEqual({ error: 'Failed to calculate monthly summary' });
  });
});

it('returns 400 if CSV has a header but contains no data rows', async () => {
  const emptyCsv = 'Date,Description,Amount,Type\n';

  const res = await request(app)
    .post('/api/transactions/upload-csv')
    .attach('file', Buffer.from(emptyCsv), 'empty.csv')
    .expect(400);

  expect(res.body).toEqual({ error: 'CSV file contains no valid rows' });
});

it('falls back to current date when a CSV row has an invalid date string', async () => {
  const csvWithBadDate = [
    'Date,Description,Amount,Type',
    'not-a-real-date,Groceries,25.00,EXPENSE',
  ].join('\n');

  const createManySpy = vi.spyOn(prisma.transaction, 'createMany').mockResolvedValue({ count: 1 });

  await request(app)
    .post('/api/transactions/upload-csv')
    .attach('file', Buffer.from(csvWithBadDate), 'invalid_date.csv')
    .expect(201);

  expect(createManySpy).toHaveBeenCalledWith({
    data: [
      expect.objectContaining({
        description: 'Groceries',
        amount: 25,
        type: 'EXPENSE',
        date: expect.any(Date),
      }),
    ],
    skipDuplicates: true,
  });
});

describe('POST /api/transactions', () => {
    it('returns 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({ description: 'Coffee' })
        .expect(400);

      expect(res.body).toEqual({ error: 'Missing required fields' });
    });

    it('creates transaction successfully with provided values', async () => {
      const payload = {
        description: 'Freelance Payout',
        amount: -1200.5,
        type: 'income',
        category: 'Work',
        date: '2026-11-01',
      };

      const createSpy = vi.spyOn(prisma.transaction, 'create').mockResolvedValue({
        id: 'tx_new',
        ...payload,
        amount: 1200.5,
        type: 'INCOME',
      });

      const res = await request(app)
        .post('/api/transactions')
        .send(payload)
        .expect(201);

      expect(createSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: 'Freelance Payout',
          amount: 1200.5,
          type: 'INCOME',
          category: 'Work',
        }),
      });
      expect(res.body).toHaveProperty('id', 'tx_new');
    });

    it('creates transaction using fallback defaults when category and date are absent', async () => {
      const createSpy = vi.spyOn(prisma.transaction, 'create').mockResolvedValue({ id: 'tx_fallback' });

      await request(app)
        .post('/api/transactions')
        .send({ description: 'Snack', amount: 5, type: 'EXPENSE' })
        .expect(201);

      expect(createSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          category: 'Uncategorized',
          date: expect.any(Date),
        }),
      });
    });

    it('returns 500 if database creation fails', async () => {
      vi.spyOn(prisma.transaction, 'create').mockRejectedValue(new Error('Insert failed'));

      const res = await request(app)
        .post('/api/transactions')
        .send({ description: 'Snack', amount: 5, type: 'EXPENSE' })
        .expect(500);

      expect(res.body).toEqual({ error: 'Failed to create transaction' });
    });
  });


describe('POST /api/transactions/upload-csv', () => { 
    it('returns 400 if no file is attached in the request', async () => {
      const res = await request(app)
        .post('/api/transactions/upload-csv') 
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    // Line 94 (Empty CSV)
    it('returns 400 if CSV has a header but contains no data rows', async () => {
      const emptyCsv = 'Date,Description,Amount,Type\n';

      const res = await request(app)
        .post('/api/transactions/upload-csv')
        .attach('file', Buffer.from(emptyCsv), 'empty.csv')
        .expect(400);

      expect(res.body).toEqual({ error: 'CSV file contains no valid rows' });
    });

    it('parses CSV content and calls prisma.createMany successfully', async () => {
      const rawCsvString = [
        'date,merchant,amount,category',
        '2026-10-10,Target,54.22,Shopping',
        '2026-10-12,Trader Joes,31.10,Groceries',
      ].join('\n');

      const createManySpy = vi.spyOn(prisma.transaction, 'createMany').mockResolvedValue({ count: 2 });

      const res = await request(app)
        .post('/api/transactions/upload-csv') 
        .attach('file', Buffer.from(rawCsvString), 'statement.csv')
        .expect(201); 

      expect(res.body).toHaveProperty('count', 2);
      expect(createManySpy).toHaveBeenCalledTimes(1);
    });

    // Line 105 (Invalid date fallback)
    it('falls back to current date when a CSV row has an invalid date string', async () => {
      const csvWithBadDate = [
        'Date,Description,Amount,Type',
        'not-a-real-date,Groceries,25.00,EXPENSE',
      ].join('\n');

      const createManySpy = vi.spyOn(prisma.transaction, 'createMany').mockResolvedValue({ count: 1 });

      await request(app)
        .post('/api/transactions/upload-csv')
        .attach('file', Buffer.from(csvWithBadDate), 'invalid_date.csv')
        .expect(201);

      expect(createManySpy).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            description: 'Groceries',
            amount: 25,
            type: 'EXPENSE',
            date: expect.any(Date),
          }),
        ],
        skipDuplicates: true,
      });
    });

    it('should return 500 if the uploaded CSV file is malformed', async () => {
      const malformedCsv = '"unclosed quote,broken line\nnext row';

      const res = await request(app)
        .post('/api/transactions/upload-csv') 
        .attach('file', Buffer.from(malformedCsv), 'bad.csv')
        .expect(500);

      expect(res.body).toHaveProperty('error'); 
    });
  });
});
