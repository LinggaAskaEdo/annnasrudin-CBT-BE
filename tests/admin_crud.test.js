import { jest } from '@jest/globals';

const mPrisma = {
    hasilUjian: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
    jadwalUjian: { findUnique: jest.fn(), findMany: jest.fn() },
    user: { create: jest.fn(), update: jest.fn(), delete: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
    rombel: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() }
};

// Mocking authUtils
jest.unstable_mockModule('../src/utils/authUtils.js', () => ({
  verifyToken: jest.fn(() => ({ id: 'current-admin', username: 'admin_test', role: 'ADMIN', sessionId: 'session-1' })),
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
                    username: 'admin_test',
                    role: 'ADMIN', 
                    currentSessionId: 'session-1' 
                });
            }
            if (where.id === 'user-to-delete' || where.id === 'user-id') {
                return Promise.resolve({
                    id: where.id,
                    username: 'target-user',
                    role: 'SISWA'
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

    describe('User Management', () => {
        test('GET /api/admin/users should return all users', async () => {
            mPrisma.user.findMany.mockResolvedValue([{ id: '1', username: 'admin' }]);

            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('DELETE /api/admin/users/:id should delete a user', async () => {
            mPrisma.user.delete.mockResolvedValue({ id: 'user-to-delete' });

            const res = await request(app)
                .delete('/api/admin/users/user-to-delete')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
        });

        test('PATCH /api/admin/users/:id/password should change password', async () => {
            mPrisma.user.update.mockResolvedValue({ id: 'user-id' });

            const res = await request(app)
                .patch('/api/admin/users/user-id/password')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ newPassword: 'new-secure-password' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
        });
    });

    describe('Rombel Management', () => {
        test('POST /api/admin/rombel should create a new rombel', async () => {
            mPrisma.rombel.create.mockResolvedValue({ id: 'r1', name: '7A' });

            const res = await request(app)
                .post('/api/admin/rombel')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ name: '7A' });

            expect(res.statusCode).toEqual(201);
            expect(res.body.data.name).toEqual('7A');
        });

        test('GET /api/admin/rombel should return all rombels', async () => {
            mPrisma.rombel.findMany.mockResolvedValue([{ id: 'r1', name: '7A' }]);

            const res = await request(app)
                .get('/api/admin/rombel')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });
});
