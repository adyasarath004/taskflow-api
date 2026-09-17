const request = require('supertest');

jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

const db = require('../src/config/db');
const app = require('../src/app');

describe('Auth endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user successfully', async () => {
      db.query
        .mockResolvedValueOnce([[]]) // no existing user
        .mockResolvedValueOnce([{ insertId: 1 }]); // insert result

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'secret123' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body.email).toBe('jane@example.com');
    });

    it('rejects registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'jane@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('rejects registration when email already exists', async () => {
      db.query.mockResolvedValueOnce([[{ id: 5 }]]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'secret123' });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('rejects login with unknown email', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'secret123' });

      expect(res.statusCode).toBe(401);
    });

    it('rejects login when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com' });

      expect(res.statusCode).toBe(400);
    });
  });
});
