import { jest } from '@jest/globals';

const mPrisma = {
    paketUjian: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
    soal: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
    jadwalUjian: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
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

const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Exam Management Unit Tests', () => {
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

    describe('Exam Packages', () => {
        test('POST /api/exams/packages should create a package', async () => {
            mPrisma.paketUjian.create.mockResolvedValue({ id: 'p1', title: 'UTS Math' });
            const res = await request(app)
                .post('/api/exams/packages')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ title: 'UTS Math', mapelId: 'm1' });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.title).toBe('UTS Math');
        });

        test('GET /api/exams/my-packages should return packages', async () => {
            mPrisma.paketUjian.findMany.mockResolvedValue([{ id: 'p1' }]);
            const res = await request(app)
                .get('/api/exams/my-packages')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });

    describe('Questions', () => {
        test('POST /api/exams/questions should add a question', async () => {
            mPrisma.paketUjian.findUnique.mockResolvedValue({ id: 'p1', guruId: 'guru-1' });
            mPrisma.soal.create.mockResolvedValue({ id: 'q1', type: 'PILGAN' });

            const res = await request(app)
                .post('/api/exams/questions')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ paketUjianId: 'p1', type: 'PILGAN', questionText: '1+1?' });

            expect(res.statusCode).toBe(201);
        });
    });

    describe('Scheduling', () => {
        test('POST /api/exams/schedule should schedule an exam', async () => {
            mPrisma.paketUjian.findUnique.mockResolvedValue({ id: 'p1', guruId: 'guru-1' });
            mPrisma.jadwalUjian.create.mockResolvedValue({ id: 's1', paketUjianId: 'p1' });

            const res = await request(app)
                .post('/api/exams/schedule')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ paketUjianId: 'p1', rombelId: 'r1', startAt: new Date(), endAt: new Date() });

            expect(res.statusCode).toBe(201);
        });
    });
});
