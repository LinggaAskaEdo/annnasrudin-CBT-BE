import { jest } from '@jest/globals';

// Mocking authUtils BEFORE anything else
jest.unstable_mockModule('../src/utils/authUtils.js', () => ({
  verifyToken: jest.fn(() => ({ id: 'user-1', role: 'SISWA', sessionId: 'session-1' })),
  hashPassword: jest.fn(() => 'hashed-pass'),
  comparePassword: jest.fn(() => true),
  generateDefaultPassword: jest.fn(() => 'H7HGX4'),
  generateToken: jest.fn(() => 'fake-jwt-token'),
}));

// Mocking Prisma Client BEFORE anything else
const mPrisma = {
  hasilUjian: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  jadwalUjian: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
      update: jest.fn(),
      findUnique: jest.fn()
  }
};

jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mPrisma)
}));

// Now we can import the app and others
const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Scoring Logic Unit Tests', () => {
  let mockToken = 'fake-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for authentication middleware pass
    mPrisma.user.findUnique.mockResolvedValue({ 
      id: 'user-1', 
      role: 'SISWA', 
      currentSessionId: 'session-1' 
    });
  });

  describe('submitExam', () => {
    test('should save correct Pilgan answers into scorePilgan', async () => {
      // Mock active session
      mPrisma.hasilUjian.findFirst.mockResolvedValue({ id: 'session-1', status: 'ONGOING' });
      
      // Mock schedule and package
      mPrisma.jadwalUjian.findUnique.mockResolvedValue({
        id: 'schedule-1',
        deadline: new Date(Date.now() + 100000),
        paketUjian: {
          title: 'Ujian IPA',
          soals: [
            { id: '1', questionType: 'PILGAN', correctAnswer: 'A' },
            { id: '2', questionType: 'PILGAN', correctAnswer: 'B' },
            { id: '3', questionType: 'URAIAN' }
          ]
        }
      });

      const responses = [
        { soalId: '1', answer: 'A' }, // Correct
        { soalId: '2', answer: 'C' }, // Incorrect
        { soalId: '3', answer: 'Jawaban panjang' }
      ];

      const res = await request(app)
        .post('/api/siswa/exams/schedule-1/submit')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ answers: responses });

      if (res.statusCode !== 200) {
          console.log('Submit Exam Response:', res.body);
      }

      expect(mPrisma.hasilUjian.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
            scorePilgan: 1
        })
      }));
      
      expect(res.body.status).toEqual('success');
      expect(res.body.scorePilgan).toEqual(1);
    });
  });

  describe('gradeUraian', () => {
    test('should save manual Uraian grades into scoreUraian', async () => {
      // Mock submission
      mPrisma.hasilUjian.findUnique.mockResolvedValue({
        id: 'hasil-1',
        jadwalUjianId: 'schedule-1',
        scorePilgan: 1,
        answers: [
            { soalId: '1', answer: 'A', type: 'PILGAN' },
            { soalId: '3', answer: 'Jawaban panjang', type: 'URAIAN' }
        ]
      });

      // Mock schedule for re-calculation
      mPrisma.jadwalUjian.findUnique.mockResolvedValue({
        id: 'schedule-1',
        paketUjian: {
          soals: [
            { id: '1', questionType: 'PILGAN', correctAnswer: 'A' },
            { id: '3', questionType: 'URAIAN' }
          ]
        }
      });

      const uraianGrades = [
        { soalId: '3', guruScore: 10, feedback: 'Bagus' }
      ];

      // Change role to GURU for this test
      import('../src/utils/authUtils.js').then(m => {
          m.verifyToken.mockReturnValue({ id: 'user-1', role: 'GURU', sessionId: 'session-1' });
      });

      const res = await request(app)
        .patch('/api/guru/submissions/hasil-1/grade')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ uraianGrades });

      if (res.statusCode !== 200) {
          console.log('Grade Uraian Response:', res.body);
      }

      expect(mPrisma.hasilUjian.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
            scoreUraian: 10
        })
      }));

      expect(res.body.status).toEqual('success');
    });
  });
});
