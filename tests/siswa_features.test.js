import { jest } from '@jest/globals';

const mPrisma = {
    user: { update: jest.fn(), findUnique: jest.fn() },
    modul: { findMany: jest.fn() },
    jadwalUjian: { findMany: jest.fn(), findUnique: jest.fn() },
    hasilUjian: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findFirst: jest.fn(), upsert: jest.fn() },
    soal: { findMany: jest.fn() }
};

jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mPrisma)
}));

jest.unstable_mockModule('../src/utils/authUtils.js', () => ({
    verifyToken: jest.fn(() => ({ id: 'siswa-1', role: 'SISWA', username: 'siswa_test', sessionId: 'session-1' })),
    hashPassword: jest.fn(() => 'hashed-pwd'),
    comparePassword: jest.fn(() => true),
    generateDefaultPassword: jest.fn(() => 'XYZ123'),
    generateToken: jest.fn(() => 'fake-token')
}));

const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Siswa Features Unit Tests', () => {
    const mockToken = 'fake-siswa-token';

    beforeEach(() => {
        jest.clearAllMocks();
        // Base user mock that works for both auth and controller logic
        const baseUser = { 
            id: 'siswa-1', 
            role: 'SISWA', 
            username: 'siswa_test', 
            currentSessionId: 'session-1', 
            rombelId: 'r1' 
        };
        
        mPrisma.user.findUnique.mockImplementation(({ where }) => {
            if (where.id === 'siswa-1') return Promise.resolve(baseUser);
            return Promise.resolve(null);
        });
        
        // Default empty arrays for findMany to prevent TypeError length
        mPrisma.modul.findMany.mockResolvedValue([]);
        mPrisma.jadwalUjian.findMany.mockResolvedValue([]);
        mPrisma.hasilUjian.findMany.mockResolvedValue([]);
        mPrisma.hasilUjian.findFirst.mockResolvedValue(null);
    });

    describe('Siswa Profile', () => {
        test('PATCH /api/siswa/profile should update password', async () => {
            mPrisma.user.update.mockResolvedValue({ id: 'siswa-1' });

            const res = await request(app)
                .patch('/api/siswa/profile')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ password: 'newpassword123' });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
        });
    });

    describe('Learning Materials', () => {
        test('GET /api/siswa/modules should return available modules', async () => {
            mPrisma.modul.findMany.mockResolvedValue([{ id: 'm1', title: 'Math 1' }]);

            const res = await request(app)
                .get('/api/siswa/modules')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });

    describe('Exam Sessions', () => {
        test('GET /api/siswa/exams should return scheduled exams', async () => {
            mPrisma.jadwalUjian.findMany.mockResolvedValue([{ 
                id: 'j1', 
                paketUjianId: 'p1',
                paketUjian: { title: 'UTS', mapel: { name: 'Math' } },
                hasilUjians: [],
                startTime: new Date(),
                deadline: new Date(Date.now() + 3600000)
            }]);

            const res = await request(app)
                .get('/api/siswa/exams')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('POST /api/siswa/exams/:id/start should create a session', async () => {
            mPrisma.jadwalUjian.findUnique.mockResolvedValue({ 
                id: 'j1', 
                startAt: new Date(Date.now() - 1000), 
                deadline: new Date(Date.now() + 100000), 
                paketUjianId: 'p1',
                paketUjian: { soals: [{ id: 'q1', type: 'PILGAN' }] }
            });
            mPrisma.hasilUjian.findMany.mockResolvedValue([]); // For check existing session
            mPrisma.hasilUjian.create.mockResolvedValue({ id: 'h1', status: 'ONGOING' });

            const res = await request(app)
                .post('/api/siswa/exams/j1/start')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.session).toBeDefined();
        });
    });

    describe('Results History', () => {
        test('GET /api/siswa/results should return history', async () => {
            mPrisma.hasilUjian.findMany.mockResolvedValue([{ id: 'h1', scorePilgan: 80 }]);

            const res = await request(app)
                .get('/api/siswa/results')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });
});
