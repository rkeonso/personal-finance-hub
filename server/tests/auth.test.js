process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

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

describe('POST /api/auth/register', () => {
  it('should return 400 if email is missing but password is provided', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ password: 'Password123!' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Email and password required');
  });

  it('should return 500 if database query throws an unexpected error', async () => {
    // Force Prisma to throw an unhandled rejection
    prisma.user.findUnique.mockRejectedValueOnce(new Error('DB Connection Timeout'));

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'crash@umn.edu', password: 'Password123!' })
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); 
  });

  it('returns 401 if email or password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@umn.edu' }); 

    expect(res.status).toBe(401); // 👈 FIXED: Changed from 500 to 401
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('returns 401 if user does not exist', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notfound@umn.edu', password: 'Password123!' });

    expect(res.status).toBe(401); 
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('returns 401 if password does not match', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'usr_123',
      email: 'user@umn.edu',
      passwordHash: '$2b$10$hashedPasswordSample', 
    });

    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@umn.edu', password: 'WrongPassword' });

    expect(res.status).toBe(401);
  });

  it('returns 200 and sets cookie/token on successful login', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'usr_123',
      email: 'user@umn.edu',
      passwordHash: '$2b$10$hashedPasswordSample',
    });

    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    vi.spyOn(jwt, 'sign').mockReturnValue('mocked_jwt_token');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@umn.edu', password: 'CorrectPassword' });

    expect(res.status).toBe(200);

     expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('token=mocked_jwt_token')])
    );
    expect(res.body).toEqual({ id: 'usr_123', email: 'user@umn.edu' });
  });

  it('returns 500 when database throws an unexpected error during login', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockRejectedValue(new Error('Database connection failed'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@umn.edu', password: 'Password123!' })
      .expect(500);

    expect(res.body).toEqual({ error: 'Database connection failed' });
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears the token cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .expect(200);

    expect(res.body.message).toBe('Logged out successfully');
    expect(res.headers['set-cookie'][0]).toContain('token=;'); // Checks if cookie was cleared
  });
});


});