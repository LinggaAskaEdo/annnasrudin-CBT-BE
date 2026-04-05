import { jest } from '@jest/globals';

const mPrisma = {
    user: { update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    hasilUjian: { findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    rombel: { create: jest.fn(), findMany: jest.fn() }
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

describe('Guru Features Unit Tests', () => {
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
    

    describe('Guru Profile', () => {
        test('PATCH /api/guru/profile should update name and jabatan', async () => {
            mPrisma.user.update.mockResolvedValue({ id: 'guru-1', name: 'Guru Baru' });

            const res = await request(app)
                .patch('/api/guru/profile')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ name: 'Guru Baru', jabatan: 'Wali Kelas' });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
        });
    });

    describe('Siswa Management by Guru', () => {
        test('GET /api/guru/siswa should return list of students', async () => {
            mPrisma.user.findMany.mockResolvedValue([{ id: 's1', role: 'SISWA', username: 'siswa1' }]);

            const res = await request(app)
                .get('/api/guru/siswa')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('POST /api/guru/siswa should allow guru to create student', async () => {
            mPrisma.user.create.mockResolvedValue({ id: 's2', role: 'SISWA', username: 'siswa2' });

            const res = await request(app)
                .post('/api/guru/siswa')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ username: 'siswa2', name: 'Siswa Dua', role: 'SISWA' });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
        });
    });

    describe('Manual Grading', () => {
        test('GET /api/guru/submissions/:id should return submission detail', async () => {
            mPrisma.hasilUjian.findUnique.mockResolvedValue({ id: 'h1', answers: [] });

            const res = await request(app)
                .get('/api/guru/submissions/h1')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.id).toBe('h1');
        });

        test('PATCH /api/guru/submissions/:id/grade should update grades', async () => {
            mPrisma.hasilUjian.findUnique.mockResolvedValue({ 
                id: 'h1', 
                answers: [{ soalId: 'q1', type: 'URAIAN', text: 'ans' }] 
            });
            mPrisma.hasilUjian.update.mockResolvedValue({ id: 'h1', scoreUraian: 10 });

            const res = await request(app)
                .patch('/api/guru/submissions/h1/grade')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ uraianGrades: [{ soalId: 'q1', guruScore: 10, feedback: 'Bagus' }] });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
        });
    });
});
