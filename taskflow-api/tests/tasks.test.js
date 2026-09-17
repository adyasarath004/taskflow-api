const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

const db = require('../src/config/db');
const app = require('../src/app');

const token = jwt.sign({ id: 1, email: 'jane@example.com' }, 'test_secret', { expiresIn: '1h' });
const authHeader = `Bearer ${token}`;

describe('Task endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
  });

  it('rejects requests with an invalid token', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', 'Bearer garbage.token.here');
    expect(res.statusCode).toBe(401);
  });

  it('lists tasks for the authenticated user', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, title: 'Write tests', status: 'pending' }]]);

    const res = await request(app).get('/api/tasks').set('Authorization', authHeader);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Write tests');
  });

  it('creates a new task', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 42 }]);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Deploy to Docker' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 42);
    expect(res.body.status).toBe('pending');
  });

  it('rejects task creation without a title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ description: 'Missing a title' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 404 when updating a task that does not exist', async () => {
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .put('/api/tasks/999')
      .set('Authorization', authHeader)
      .send({ title: 'Updated title' });

    expect(res.statusCode).toBe(404);
  });

  it('deletes an existing task', async () => {
    db.query
      .mockResolvedValueOnce([[{ id: 1, title: 'Write tests' }]])
      .mockResolvedValueOnce([{}]);

    const res = await request(app).delete('/api/tasks/1').set('Authorization', authHeader);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });
});
