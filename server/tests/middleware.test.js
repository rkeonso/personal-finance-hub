import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../src/middleware/auth.js';

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Clear spy implementations between tests
  });

  it('returns 401 if no authorization header or cookie is present', () => {
    const req = { headers: {}, cookies: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 or 401 if token is invalid or expired', () => {
    //  Put the token inside cookies.token to match your middleware
    const req = { headers: {}, cookies: { token: 'invalid_token' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('jwt expired');
    });

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403); // Match 403 status 
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and attaches user to req when token is valid', () => {
    const mockUser = { userId: 'usr_123', email: 'test@umn.edu' };
    // Put the token inside cookies.token here too
    const req = { headers: {}, cookies: { token: 'valid_token' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    vi.spyOn(jwt, 'verify').mockReturnValue(mockUser);

    requireAuth(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
