process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

// Mock the named export { prisma }
vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Personal Finance API Integration Tests - Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 Bad Request if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'student@umn.edu' }) // missing password
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password required');
    });

    it('should return 400 Bad Request if user already exists', async () => {
      // Simulate finding an existing user in the database
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'usr_existing',
        email: 'exists@umn.edu',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'exists@umn.edu', password: 'Password123!' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'User already exists');
    });

    it('should return 201 Created when payload is valid and user is new', async () => {
      // Simulate no existing user found
      prisma.user.findUnique.mockResolvedValueOnce(null);

      // Simulate successful user creation in Prisma
      prisma.user.create.mockResolvedValueOnce({
        id: 'usr_new_123',
        email: 'newuser@umn.edu',
        password: 'hashed_password_mock',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'newuser@umn.edu', password: 'Password123!' });

      if (response.status === 500) {
        console.log('--- 500 INTERNAL SERVER ERROR DETAILS ---');
        console.log(response.body);
        console.log('-----------------------------------------');
      }

      // check whether your route returns 201 or 200 upon creation
      expect([200, 201]).toContain(response.status);
    });
  });
});