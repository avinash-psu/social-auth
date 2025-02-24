const request = require('supertest');
const { app, startServer } = require('./server');
const sqlite3 = require('sqlite3').verbose();

let server;

beforeAll((done) => {
  server = startServer();
  done();
});

afterAll((done) => {
  server.close(done);
});

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({
        sub: '123456789',
        email: 'test@example.com',
        name: 'Test User'
      })
    })
  }))
}));

const db = new sqlite3.Database(':memory:');

describe('Server Endpoints', () => {
  beforeAll((done) => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      loginTime TEXT,
      logoutTime TEXT
    )`, done);
  });

  afterAll((done) => {
    db.close(done);
  });

  beforeEach((done) => {
    db.run('DELETE FROM users', done);
  });

  // Test GET /
  test('GET / should serve the index.html file', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
  });

  // Test POST /auth/google (Happy Path)
  test('POST /auth/google should authenticate user', async () => {
    const response = await request(app)
      .post('/auth/google')
      .send({ token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkMTJhYjc4MmNiNjA5NjI4NWY2OWU0OGFlYTk5MDc5YmI1OWNiODYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1NjQ1MDc2MTUwMjAtNWE2Z2M5cjFxbjRzcDFxam9udHJqaDIxNGxpc3QyYm4uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1NjQ1MDc2MTUwMjAtNWE2Z2M5cjFxbjRzcDFxam9udHJqaDIxNGxpc3QyYm4uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDA3ODM3OTYyNjU1NDkwNzIxMjUiLCJlbWFpbCI6ImR0bndvcmswQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3Mzk3NjE1MzEsIm5hbWUiOiJkdG4gd29yayIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMQm12VWwxVE9hclV1cHIxZFVLbVduRHI0elpZd3N0R3NHRGUzellCRDJma3Q1MkI4PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6ImR0biIsImZhbWlseV9uYW1lIjoid29yayIsImlhdCI6MTczOTc2MTgzMSwiZXhwIjoxNzM5NzY1NDMxLCJqdGkiOiI2ZjNiM2FkYjY0ZmVkMGRkYjAyODFlYzJjZGE4OTEzYTgwYWI5Nzk3In0.YR-6hQ0EKqZUNm2jGuNHfYcgfsECDORthJB0LOgRnk20mtgcHr0lG2FHjbh25WdniLRGQfMM-1nN8hA5M2V7DfvwOIhpT8ly8PghiDE0P-MQaEX1puQnHZ7feJiOCe2tAhB6TKdx-Ik-2y9zyLfGh08Z82qfQ5fIv7kF_e2ImMF_Qt7QB4Orn6lZpXvpLTJPnFmjF70QybI9jE3tqpLUKsp0jHeNx6Du-nib4Oxt8WrDKeBbVQusrxICzELwhwMrgmLHr3rm4uNAJaREcDsPaSUEYMhzhjF4SEZegHYuaAJh1NXWmfG0CpOfW6LSA3y3TAgNHx3nIpH4at06MpBsfA' });

    expect(response.status).toBe(200);
  });

  // Test POST /auth/google (Error Handling)
  test('POST /auth/google should handle invalid token', async () => {
    const invalidToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiZDY3NzRlMDljMDc4MDc0NzZhODk5ZjhlZGZhNGNkOTcxNzI1MGIiLCJ0eXAiOiJKV1QifQ.invalid_token_payload.invalid_signature';
  
    const response = await request(app)
      .post('/auth/google')
      .send({ token: invalidToken });
    expect(response.status).toBe(200);
  });
      
  
  test('GET /user should return user data for authenticated user', async () => {
    // First, simulate user authentication
    const authResponse = await request(app)
      .post('/auth/google')
      .send({ token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkMTJhYjc4MmNiNjA5NjI4NWY2OWU0OGFlYTk5MDc5YmI1OWNiODYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1NjQ1MDc2MTUwMjAtNWE2Z2M5cjFxbjRzcDFxam9udHJqaDIxNGxpc3QyYm4uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1NjQ1MDc2MTUwMjAtNWE2Z2M5cjFxbjRzcDFxam9udHJqaDIxNGxpc3QyYm4uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDA3ODM3OTYyNjU1NDkwNzIxMjUiLCJlbWFpbCI6ImR0bndvcmswQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3Mzk3NjE1MzEsIm5hbWUiOiJkdG4gd29yayIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMQm12VWwxVE9hclV1cHIxZFVLbVduRHI0elpZd3N0R3NHRGUzellCRDJma3Q1MkI4PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6ImR0biIsImZhbWlseV9uYW1lIjoid29yayIsImlhdCI6MTczOTc2MTgzMSwiZXhwIjoxNzM5NzY1NDMxLCJqdGkiOiI2ZjNiM2FkYjY0ZmVkMGRkYjAyODFlYzJjZGE4OTEzYTgwYWI5Nzk3In0.YR-6hQ0EKqZUNm2jGuNHfYcgfsECDORthJB0LOgRnk20mtgcHr0lG2FHjbh25WdniLRGQfMM-1nN8hA5M2V7DfvwOIhpT8ly8PghiDE0P-MQaEX1puQnHZ7feJiOCe2tAhB6TKdx-Ik-2y9zyLfGh08Z82qfQ5fIv7kF_e2ImMF_Qt7QB4Orn6lZpXvpLTJPnFmjF70QybI9jE3tqpLUKsp0jHeNx6Du-nib4Oxt8WrDKeBbVQusrxICzELwhwMrgmLHr3rm4uNAJaREcDsPaSUEYMhzhjF4SEZegHYuaAJh1NXWmfG0CpOfW6LSA3y3TAgNHx3nIpH4at06MpBsfA' });
  
    // Get the session cookie from the authentication response
    const cookies = authResponse.headers['set-cookie'];
  
    // Now, make a request to /user with the session cookie
    const userResponse = await request(app)
      .get('/user')
      .set('Cookie', cookies);
  
    // Check the response
    expect(userResponse.status).toBe(200);
    expect(userResponse.body).toEqual({
      status: 'success',
      user: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });
  });
  
  

  // Test GET /user (Unauthenticated)
  test('GET /user should return 401 for unauthenticated user', async () => {
    const response = await request(app).get('/user');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Not authenticated'
    });
  });

  // Test POST /logout (Unauthenticated)
  test('POST /logout should return 401 for unauthenticated user', async () => {
    const response = await request(app).post('/logout');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Not authenticated'
    });
  });

  function generateRandomEmail() {
    const domains = ['gmail.com'];
    const localPart = Math.random().toString(36).substring(2, 10);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${localPart}@${domain}`;
  }
  // Test POST /register (New User)
  test('POST /register should register a new user', async () => {
    const emailHolder = generateRandomEmail();
    const response = await request(app)
    .post('/register')
    .send({
      email: `${emailHolder}`,
      name: `Testing User ${Math.random()}`
    });

  expect(response.status).toBe(200);
  expect(response.body.status).toBe('success');
  });

  // 18. Test POST /register (Missing Email)
  test('POST /register should handle missing email', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: "",
        name: "Avinash Tiwari"
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Email is required'
    });
  });

  // Test POST /register (Missing Name)
  test('POST /register should handle missing name', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: "newuser@example.com",
        name: ""
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Name is required'
    });
  });

  // Test POST /auth/google (Missing Token)
  test('POST /auth/google should handle missing token', async () => {
    const response = await request(app)
      .post('/auth/google')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Invalid token format'
    });
  });

  // Test unexpected errors
  test('Server should handle unexpected errors', async () => {
    jest.spyOn(app, 'get').mockImplementationOnce((path, handler) => {
      if (path === '/test-error') {
        handler({}, {}, () => {
          throw new Error('Unexpected error');
        });
      }
    });

    const response = await request(app).get('/test-error');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({});
  });
});

// Close any open handles after all tests are done
afterAll(done => {
    done();
});
