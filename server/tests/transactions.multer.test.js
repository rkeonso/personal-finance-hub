import { vi, describe, it, expect } from 'vitest';
import request from 'supertest';

// 1. Mock Multer to simulate storage that does NOT populate req.file.buffer
vi.mock('multer', () => {
  const multerMock = () => ({
    single: () => (req, res, next) => {
      req.file = {
        fieldname: 'file',
        originalname: 'statement.csv',
        mimetype: 'text/csv',
        size: 128,
        // buffer is intentionally omitted
      };
      next();
    },
  });

  multerMock.memoryStorage = vi.fn();
  multerMock.diskStorage = vi.fn();

  return { default: multerMock };
});

// 2. Mock auth middleware
vi.mock('../src/middleware/auth.js', () => ({
  requireAuth: (req, res, next) => {
    req.user = { userId: 'mock-user-123' };
    next();
  },
}));

// 3. Import app AFTER mocks are established
import app from '../src/app.js';

describe('POST /api/transactions/upload-csv - Storage Misconfiguration', () => {
  it('returns 500 when req.file.buffer is missing (Line 95)', async () => {
    const res = await request(app)
      .post('/api/transactions/upload-csv')
      .expect(500);

    expect(res.body).toEqual({
      error: 'Multer is not configured with memoryStorage',
    });
  });
});