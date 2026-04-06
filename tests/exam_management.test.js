import { jest } from '@jest/globals';

const mPrisma = {
    ujian: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
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

    describe('Ujian', () => {
        test('POST /api/ujian should create an exam', async () => {
            mPrisma.ujian.create.mockResolvedValue({ id: 'p1', title: 'UTS Math' });
            const res = await request(app)
                .post('/api/ujian')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ title: 'UTS Math', mapel: 'Matematika' });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.title).toBe('UTS Math');
        });

        test('GET /api/ujian should return exams', async () => {
            mPrisma.ujian.findMany.mockResolvedValue([{ id: 'p1' }]);
            const res = await request(app)
                .get('/api/ujian')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });

    describe('Soal', () => {
        test('POST /api/ujian/soal should add a question', async () => {
            mPrisma.ujian.findUnique.mockResolvedValue({ id: 'p1', createdById: 'guru-1' });
            mPrisma.soal.create.mockResolvedValue({ id: 'q1', type: 'PILGAN' });

            const res = await request(app)
                .post('/api/ujian/soal')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ ujianId: 'p1', type: 'PILGAN', questionText: '1+1?' });

            expect(res.statusCode).toBe(201);
        });
    });

    describe('Scheduling', () => {
        test('POST /api/ujian/schedule should schedule an exam', async () => {
            mPrisma.ujian.findUnique.mockResolvedValue({ id: 'p1', createdById: 'guru-1' });
            mPrisma.jadwalUjian.create.mockResolvedValue({ id: 's1', ujianId: 'p1' });

            const res = await request(app)
                .post('/api/ujian/schedule')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ ujianId: 'p1', rombelId: 'r1', startAt: new Date(), endAt: new Date() });

            expect(res.statusCode).toBe(201);
        });
    });
});
