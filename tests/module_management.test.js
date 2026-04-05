import { jest } from '@jest/globals';

const mPrisma = {
    modul: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
    user: { findUnique: jest.fn() }
};

jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mPrisma)
}));

jest.unstable_mockModule('../src/utils/authUtils.js', () => ({
    verifyToken: jest.fn(() => ({ id: 'guru-1', role: 'GURU', username: 'guru_test', sessionId: 'session-1' })),
    hashPassword: jest.fn(() => 'hashed-pwd'),
    comparePassword: jest.fn(() => true),
    generateDefaultPassword: jest.fn(() => 'XYZ123'),
    generateToken: jest.fn(() => 'fake-token')
}));

// Mocking path to avoid filesystem issues in tests
const pathMock = {
    join: jest.fn((...args) => args.filter(a => typeof a === 'string').join('/')),
    resolve: jest.fn((...args) => args.filter(a => typeof a === 'string').join('/')),
    basename: jest.fn((p) => p),
    extname: jest.fn(() => '.pdf'),
    default: null // Will be assigned below
};
pathMock.default = pathMock;

jest.unstable_mockModule('path', () => pathMock);

const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Module Management Unit Tests', () => {
    const mockToken = 'fake-guru-token';

    beforeEach(() => {
        jest.clearAllMocks();
        mPrisma.user.findUnique.mockImplementation(({ where }) => {
            if (where.id === 'guru-1') {
                return Promise.resolve({ id: 'guru-1', role: 'GURU', currentSessionId: 'session-1' });
            }
            return Promise.resolve(null);
        });
    });

    describe('Module CRUD', () => {
        test('POST /api/modules should upload a module', async () => {
             mPrisma.modul.create.mockResolvedValue({ id: 'm1', title: 'Math PDF', filePath: 'uploads/test.pdf' });

             // Note: In real setup, we'd use .attach() for file upload. 
             // Here we just test the endpoint hits the controller.
             const res = await request(app)
                .post('/api/modules')
                .set('Authorization', `Bearer ${mockToken}`)
                .field('title', 'Math PDF')
                .field('rombelId', 'r1')
                .attach('pdf', Buffer.from('fake-pdf-content'), 'test.pdf');

            expect(res.statusCode).toBe(201);
            expect(res.body.data.title).toBe('Math PDF');
        });

        test('GET /api/modules/my should return guru modules', async () => {
            mPrisma.modul.findMany.mockResolvedValue([{ id: 'm1', title: 'Math PDF' }]);

            const res = await request(app)
                .get('/api/modules/my')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('DELETE /api/modules/:id should delete a module', async () => {
            mPrisma.modul.findUnique.mockResolvedValue({ id: 'm1', guruId: 'guru-1' });
            mPrisma.modul.delete.mockResolvedValue({ id: 'm1' });

            const res = await request(app)
                .delete('/api/modules/m1')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
        });
    });
});
