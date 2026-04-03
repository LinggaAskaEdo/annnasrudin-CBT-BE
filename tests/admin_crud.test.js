import { jest } from '@jest/globals';

const mPrisma = {
    hasilUjian: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
    jadwalUjian: { findUnique: jest.fn(), findMany: jest.fn() },
    user: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() }
};

// Mocking authUtils
jest.unstable_mockModule('../src/utils/authUtils.js', () => ({
  verifyToken: jest.fn(() => ({ id: 'current-admin', role: 'ADMIN', sessionId: 'session-1' })),
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

describe('Admin CRUD Unit Tests', () => {
    let mockToken = 'fake-admin-token';

    beforeEach(() => {
        jest.clearAllMocks();
        // Smart mock for findUnique
        mPrisma.user.findUnique.mockImplementation(({ where }) => {
            if (where.id === 'current-admin') {
                return Promise.resolve({ 
                    id: 'current-admin', 
                    role: 'ADMIN', 
                    currentSessionId: 'session-1' 
                });
            }
            return Promise.resolve(null);
        });
    });

    describe('Admin Creation', () => {
        test('POST /api/admin/users should allow creating another ADMIN', async () => {
            mPrisma.user.create.mockResolvedValue({ id: 'new-admin', role: 'ADMIN', username: 'admin2' });

            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    username: 'admin2',
                    name: 'Admin-Secondary',
                    role: 'ADMIN'
                });

            if (res.statusCode !== 200 && res.statusCode !== 201) {
                console.log('Admin Creation Response:', res.body);
            }

            expect(mPrisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    role: 'ADMIN'
                })
            }));

            expect(res.body.status).toEqual('success');
            expect(res.body.data.user.role).toEqual('ADMIN');
        });
    });

    describe('Admin Profile Update', () => {
        test('PATCH /api/admin/profile should allow updating details', async () => {
            mPrisma.user.update.mockResolvedValue({ id: 'current-admin', name: 'New Admin Name' });

            const res = await request(app)
                .patch('/api/admin/profile')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    name: 'New Admin Name'
                });

            if (res.statusCode !== 200) {
                console.log('Admin Profile Update Response:', res.body);
            }

            expect(mPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'current-admin' },
                data: expect.objectContaining({
                    name: 'New Admin Name'
                })
            }));

            expect(res.body.status).toEqual('success');
        });
    });
});
