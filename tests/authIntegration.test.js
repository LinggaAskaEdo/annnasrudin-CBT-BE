import { jest } from '@jest/globals';

// Mocking authService BEFORE anything else
// Note: We need to use default export because that's how it's imported in controllers sometimes, 
// but here it's usually named exports.
jest.unstable_mockModule('../src/services/authService.js', () => ({
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
}));

const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');
const authService = await import('../src/services/authService.js');

describe('Auth Controller Integration', () => {
  test('POST /api/auth/login should return 200 and token on success', async () => {
    const mockUser = { id: '1', username: 'admin', role: 'ADMIN' };
    const mockToken = 'fake-jwt-token';
    
    // Setup mock success
    authService.loginUser.mockResolvedValue({ user: mockUser, token: mockToken });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.data.token).toEqual(mockToken);
  });

  test('POST /api/auth/login should return 401 on failure', async () => {
    // Setup mock failure
    authService.loginUser.mockRejectedValue(new Error('Invalid username or password'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toEqual('error');
  });
});
