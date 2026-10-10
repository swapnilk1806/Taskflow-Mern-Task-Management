const assert = require('node:assert/strict');
const { after, before, describe, it } = require('node:test');
const { app } = require('../server');
const Task = require('../models/Task');
const User = require('../models/User');
const { listTasksValidation } = require('../validators/taskValidator');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

async function request(path, options) {
  return fetch(`${baseUrl}${path}`, options);
}

describe('TaskFlow API smoke checks', () => {
  it('accepts empty task filter values as unselected filters', async () => {
    const req = {
      query: {
        search: '',
        status: '',
        priority: '',
        sortBy: 'createdAt',
        order: 'desc',
        page: '1',
        limit: '8'
      },
      body: {},
      params: {}
    };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      }
    };

    await new Promise((resolve, reject) => {
      let middlewareIndex = 0;
      const next = (error) => {
        if (error) {
          reject(error);
          return;
        }

        const middleware = listTasksValidation[middlewareIndex++];
        if (!middleware) {
          resolve();
          return;
        }

        try {
          Promise.resolve(middleware(req, res, next)).catch(reject);
        } catch (error) {
          reject(error);
        }
      };

      next();
    });

    assert.equal(res.body, undefined);
  });

  it('keeps password hashes out of serialized user profiles', () => {
    const user = new User({
      name: 'Taylor Morgan',
      email: 'taylor@example.com',
      password: 'password-that-is-not-returned'
    });

    assert.equal(user.toJSON().password, undefined);
    assert.equal(User.schema.path('password').options.select, false);
  });

  it('validates task ownership, title, and enums at the model layer', async () => {
    const task = new Task({ title: 'A valid task', status: 'unknown' });
    const error = task.validateSync();

    assert.ok(error);
    assert.ok(error.errors.user);
    assert.ok(error.errors.status);
    assert.ok(error.errors.title === undefined);
  });

  it('reports database readiness as unavailable without a database connection', async () => {
    const response = await request('/api/health');
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(body.data.database, 'disconnected');
  });

  it('requires a bearer token before serving task routes', async () => {
    const response = await request('/api/tasks');
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.success, false);
  });

  it('allows the localhost and loopback aliases for the configured frontend origin', async () => {
    const configuredClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const configuredOrigin = new URL(configuredClientUrl);
    const aliasHost = configuredOrigin.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
    const aliasOrigin = `${configuredOrigin.protocol}//${aliasHost}${configuredOrigin.port ? `:${configuredOrigin.port}` : ''}`;
    const response = await request('/api/auth/register', {
      method: 'OPTIONS',
      headers: {
        Origin: aliasOrigin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), aliasOrigin);
  });

  it('rejects invalid registration input with field details', async () => {
    const response = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'invalid', password: 'short' })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.ok(Array.isArray(body.errors));
  });

  it('rejects invalid JSON and non-object request bodies safely', async () => {
    const malformed = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{'
    });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).message, 'Request body contains invalid JSON.');

    const array = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '[]'
    });
    assert.equal(array.status, 400);
    assert.equal((await array.json()).message, 'Request body must be a JSON object.');
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const response = await request('/api/does-not-exist');
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.match(body.message, /Route not found/);
  });
});
