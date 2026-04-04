import { PrismaClient } from '@prisma/client';
import winston from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Siswa starts an exam session.
 */
export const startExam = async (req, res, next) => {
  const { scheduleId } = req.params;
  const siswaId = req.user.id;

  try {
    const schedule = await prisma.jadwalUjian.findUnique({
      where: { id: scheduleId },
      include: { 
          paketUjian: { include: { soals: true } },
          hasilUjians: { where: { siswaId } }
      }
    });

    if (!schedule) return res.status(404).json({ status: 'error', message: 'Exam not found' });
    if (schedule.hasilUjians.length > 0 && schedule.hasilUjians[0].status === 'COMPLETED') {
      return res.status(400).json({ status: 'error', message: 'Exam already submitted' });
    }

    const now = new Date();
    
    // Lazy Force-Submit: If deadline passed but session is still ONGOING
    if (schedule.hasilUjians.length > 0 && schedule.hasilUjians[0].status === 'ONGOING' && now > schedule.deadline) {
        await prisma.hasilUjian.update({
            where: { id: schedule.hasilUjians[0].id },
            data: { status: 'COMPLETED' }
        });
        return res.status(400).json({ status: 'error', message: 'Exam period has ended' });
    }

    if (now < schedule.startTime || now > schedule.deadline) {
      return res.status(400).json({ status: 'error', message: 'Exam not available at this time' });
    }

    // Upsert the HasilUjian session to track start time
    const result = await prisma.hasilUjian.upsert({
      where: {
        id: schedule.hasilUjians.length > 0 ? schedule.hasilUjians[0].id : 'new-session-' + scheduleId + '-' + siswaId
      },
      update: {},
      create: {
          siswaId,
          jadwalUjianId: scheduleId,
          status: 'ONGOING',
          startTime: now,
          answers: []
      }
    });

    // Strip correct answers before sending to siswa
    const questionsForSiswa = schedule.paketUjian.soals.map(s => {
      const { correctAnswer, ...safeQuestion } = s;
      return safeQuestion;
    });

    res.json({
      status: 'success',
      data: {
          session: result,
          questions: questionsForSiswa
      }
    });
  } catch (error) {
    winston.error(`Starting exam failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Siswa submits their exam answers.
 * Auto-grades Pilihan Ganda (Pilgan).
 */
export const submitExam = async (req, res, next) => {
  const { scheduleId } = req.params;
  const { answers } = req.body; // Array of { soalId, answer }
  const siswaId = req.user.id;

  try {
    const session = await prisma.hasilUjian.findFirst({
        where: { jadwalUjianId: scheduleId, siswaId, status: 'ONGOING' }
    });

    if (!session) return res.status(400).json({ status: 'error', message: 'No active session found' });

    const schedule = await prisma.jadwalUjian.findUnique({
        where: { id: scheduleId },
        include: { paketUjian: { include: { soals: true } } }
    });

    // Auto-Grading Logic
    let score = 0;
    const questions = schedule.paketUjian.soals;
    const gradedAnswers = answers.map(ans => {
        const question = questions.find(q => q.id === ans.soalId);
        if (!question) return ans;

        if (question.questionType === 'PILGAN' && question.correctAnswer === ans.answer) {
            score += 1; // Basic increment, can be adjusted by weighting
        }
        return { ...ans, type: question.questionType };
    });

    // Simple Score: Sum of correct Pilihan Ganda answers (No Weighting)
    const finalScore = score;

    const now = new Date();
    if (now > schedule.deadline) {
        // Auto-submit as is if past deadline, but inform user
        await prisma.hasilUjian.update({
            where: { id: session.id },
            data: {
                scorePilgan: finalScore,
                answers: gradedAnswers,
                status: 'COMPLETED'
            }
        });
        return res.status(400).json({ status: 'error', message: 'Submitted after deadline. Score saved but marked.' });
    }

    await prisma.hasilUjian.update({
        where: { id: session.id },
        data: {
            scorePilgan: finalScore,
            answers: gradedAnswers,
            status: 'COMPLETED'
        }
    });

    winston.info(`Exam ${schedule.paketUjian.title} submitted by Siswa ${req.user.username}`);

    res.json({
        status: 'success',
        message: 'Exam submitted successfully',
        scorePilgan: finalScore
    });
  } catch (error) {
    winston.error(`Submitting exam failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
