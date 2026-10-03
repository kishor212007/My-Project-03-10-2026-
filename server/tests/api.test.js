process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';
process.env.JWT_SECRET = 'test_secret_for_unit_tests_12345';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { getDb } = require('../src/db/db');
const { seed } = require('../src/db/seed');

let demoToken = '';
let adminToken = '';
let createdPaletteId = null;

describe('Palette App API Tests', () => {
  before(() => {
    const db = getDb(':memory:');
    seed(db);
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health returns 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
      assert.equal(res.body.service, 'palette-app-api');
    });
  });

  describe('2. Authentication Routes', () => {
    it('POST /api/auth/login successfully logs in demo user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'password123'
        });
      
      assert.equal(res.status, 200);
      assert.ok(res.body.token);
      assert.equal(res.body.user.email, 'demo@example.com');
      demoToken = res.body.token;
    });

    it('POST /api/auth/login successfully logs in admin user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123'
        });
      
      assert.equal(res.status, 200);
      assert.ok(res.body.token);
      assert.equal(res.body.user.role, 'admin');
      adminToken = res.body.token;
    });

    it('POST /api/auth/login rejects wrong password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'wrongpassword'
        });
      
      assert.equal(res.status, 401);
      assert.equal(res.body.error, 'Invalid email or password');
    });

    it('POST /api/auth/register creates a brand new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newtester',
          email: 'newtester@example.com',
          password: 'securepassword'
        });

      assert.equal(res.status, 201);
      assert.ok(res.body.token);
      assert.equal(res.body.user.username, 'newtester');
    });

    it('POST /api/auth/register rejects duplicate email with 409', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'differentuser',
          email: 'demo@example.com',
          password: 'somepassword'
        });

      assert.equal(res.status, 409);
    });

    it('GET /api/auth/me returns current user info when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${demoToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, 'demo@example.com');
      assert.ok(res.body.user.palettes_count !== undefined);
    });

    it('GET /api/auth/me rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      assert.equal(res.status, 401);
    });
  });

  describe('3. Palettes Endpoints', () => {
    it('GET /api/palettes returns seed palettes', async () => {
      const res = await request(app).get('/api/palettes');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.palettes));
      assert.ok(res.body.palettes.length >= 6);
      assert.ok(res.body.total >= 6);
    });

    it('GET /api/palettes with search query filters results', async () => {
      const res = await request(app).get('/api/palettes?search=sunset');
      assert.equal(res.status, 200);
      assert.ok(res.body.palettes.length >= 1);
      assert.match(res.body.palettes[0].title.toLowerCase(), /sunset/);
    });

    it('POST /api/palettes creates a new palette when authenticated', async () => {
      const newPalette = {
        title: 'Aurora Borealis',
        colors: ['#0B132B', '#1C2541', '#3A506B', '#5BC0BE', '#6FFFE9'],
        tags: ['aurora', 'cool', 'night']
      };

      const res = await request(app)
        .post('/api/palettes')
        .set('Authorization', `Bearer ${demoToken}`)
        .send(newPalette);

      assert.equal(res.status, 201);
      assert.equal(res.body.palette.title, 'Aurora Borealis');
      assert.equal(res.body.palette.colors.length, 5);
      createdPaletteId = res.body.palette.id;
    });

    it('POST /api/palettes rejects invalid hex colors with 400', async () => {
      const invalidPalette = {
        title: 'Bad Colors',
        colors: ['#ZZZZZZ', '#123456']
      };

      const res = await request(app)
        .post('/api/palettes')
        .set('Authorization', `Bearer ${demoToken}`)
        .send(invalidPalette);

      assert.equal(res.status, 400);
    });

    it('GET /api/palettes/:id returns created palette details', async () => {
      const res = await request(app).get(`/api/palettes/${createdPaletteId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.palette.id, createdPaletteId);
      assert.equal(res.body.palette.title, 'Aurora Borealis');
    });

    it('POST /api/palettes/:id/like toggles like on a palette', async () => {
      // First like
      const resLike = await request(app)
        .post(`/api/palettes/${createdPaletteId}/like`)
        .set('Authorization', `Bearer ${demoToken}`);

      assert.equal(resLike.status, 200);
      assert.equal(resLike.body.liked, true);
      assert.equal(resLike.body.likes_count, 1);

      // Unlike
      const resUnlike = await request(app)
        .post(`/api/palettes/${createdPaletteId}/like`)
        .set('Authorization', `Bearer ${demoToken}`);

      assert.equal(resUnlike.status, 200);
      assert.equal(resUnlike.body.liked, false);
      assert.equal(resUnlike.body.likes_count, 0);
    });

    it('GET /api/palettes/mine returns user created palettes', async () => {
      const res = await request(app)
        .get('/api/palettes/mine')
        .set('Authorization', `Bearer ${demoToken}`);

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.palettes));
      assert.ok(res.body.palettes.some(p => p.id === createdPaletteId));
    });

    it('DELETE /api/palettes/:id deletes the created palette', async () => {
      const res = await request(app)
        .delete(`/api/palettes/${createdPaletteId}`)
        .set('Authorization', `Bearer ${demoToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.message, 'Palette deleted successfully');

      // Verify it is gone
      const verifyRes = await request(app).get(`/api/palettes/${createdPaletteId}`);
      assert.equal(verifyRes.status, 404);
    });
  });

  describe('4. Admin Routes and Permissions', () => {
    it('GET /api/admin/stats rejects regular user with 403', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${demoToken}`);

      assert.equal(res.status, 403);
    });

    it('GET /api/admin/stats allows admin and returns statistics', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.stats.total_users >= 2);
      assert.ok(res.body.stats.total_palettes >= 6);
    });

    it('GET /api/admin/users lists all registered users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.users));
      assert.ok(res.body.users.some(u => u.username === 'demouser'));
      assert.ok(res.body.users.some(u => u.username === 'admin'));
    });
  });
});
