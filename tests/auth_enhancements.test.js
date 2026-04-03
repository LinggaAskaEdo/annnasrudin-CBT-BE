import { jest } from '@jest/globals';

const mPrisma = {
    hasilUjian: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
    jadwalUjian: { findUnique: jest.fn(), findMany: jest.fn() },
    user: { update: jest.fn(), findUnique: jest.fn() }
};

// Mocking authUtils
jest.unstable_mockModule('../src/utils/authUtils.js', () => ({
  verifyToken: jest.fn(() => ({ id: 'user-1', role: 'ADMIN', sessionId: 'session-old' })),
  hashPassword: jest.fn(() => 'hashed-pass'),
  comparePassword: jest.fn(() => true),
  generateDefaultPassword: jest.fn(() => 'H7HGX4'),
  generateToken: jest.fn(() => 'fake-jwt-token'),
}));

// Mocking Prisma Client
jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mPrisma)
}));

const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Auth & Session Enhancements Unit Tests', () => {
    let mockToken = 'fake-token';

    beforeEach(() => {
        jest.clearAllMocks();
        mPrisma.user.findUnique.mockResolvedValue({ 
            id: 'user-1', 
            role: 'ADMIN', 
            currentSessionId: 'session-old' 
        });
    });

    describe('Logout Handler', () => {
        test('POST /api/auth/logout should clear currentSessionId', async () => {
            mPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'ADMIN', currentSessionId: 'session-old' });
            mPrisma.user.update.mockResolvedValue({ id: 'user-1', currentSessionId: null });

            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(mPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'user-1' },
                data: { currentSessionId: null }
            }));

            expect(res.body.status).toEqual('success');
            expect(res.body.message).toEqual('Logged out successfully');
        });
    });
});
