import { jest } from '@jest/globals';

const mPrisma = {
    hasilUjian: { findMany: jest.fn() },
    jadwalUjian: { findUnique: jest.fn() },
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

describe('Report Features Unit Tests', () => {
    const mockToken = 'fake-guru-token';

    beforeEach(() => {
        jest.clearAllMocks();
        mPrisma.user.findUnique.mockImplementation(({ where }) => {
            if (where.id === 'guru-1') {
                return Promise.resolve({ id: 'guru-1', role: 'GURU', currentSessionId: 'session-1' });
            }
            return Promise.resolve(null);
        });
        mPrisma.jadwalUjian.findUnique.mockResolvedValue({ 
            id: 's1', 
            paketUjian: { title: 'Exam', mapel: { name: 'Subject' } },
            rombel: { name: 'Kelas 6A' },
            hasilUjians: [
                { id: 'h1', siswa: { name: 'Siswa1', username: 's1' }, scorePilgan: 50, scoreUraian: 30, status: 'COMPLETED', updatedAt: new Date() }
            ]
        });
    });

    test('GET /api/reports/exams/:scheduleId should return composite report', async () => {
        mPrisma.hasilUjian.findMany.mockResolvedValue([
            { id: 'h1', siswa: { name: 'Siswa1' }, scorePilgan: 50, scoreUraian: 30 }
        ]);

        const res = await request(app)
            .get('/api/reports/exams/s1')
            .set('Authorization', `Bearer ${mockToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.results).toBeInstanceOf(Array);
        expect(res.body.data.results[0].totalScore).toBe(80);
    });
});
