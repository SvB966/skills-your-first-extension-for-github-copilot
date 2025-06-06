import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../server.js';

test('GET /api/students returns array', async () => {
  const res = await request(app).get('/api/students');
  assert.equal(res.status, 200);
  assert(Array.isArray(res.body));
});
