import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Personal Finance API Integration', () => {
  it('GET /api/v1/health returns 200 OK', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .expect(200);

    expect(res.body).toEqual({ status: 'ok' });
  });
});

