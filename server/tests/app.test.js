import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

describe('App & CORS Configuration', () => {
  beforeEach(() => {
    vi.resetModules(); // Reset module registry so app.js re-evaluates
  });

  it('GET /api/v1/health returns 200 ok', async () => {
    const { default: app } = await import('../src/app.js');
    const res = await request(app).get('/api/v1/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('evaluates CLIENT_URL when defined in environment', async () => {
    process.env.CLIENT_URL = 'http://localhost:3000';
    
    // Dynamic import forces app.js to re-read process.env.CLIENT_URL
    const { default: appWithCustomClient } = await import('../src/app.js');
    
    const res = await request(appWithCustomClient)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:3000')
      .expect(200);

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    
    delete process.env.CLIENT_URL; // Clean up
  });
});