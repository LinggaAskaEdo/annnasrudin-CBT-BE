import * as examSessionService from '../services/examSessionService.js';
import winston from '../utils/logger.js';

/**
 * Siswa starts an exam session.
 */
export const startExam = async (req, res, next) => {
  const { scheduleId } = req.params;
  const siswaId = req.user.id;

  try {
    const { session, questions } = await examSessionService.startExam(scheduleId, siswaId);

    res.json({
      status: 'success',
      data: {
          session,
          questions
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
    const { scorePilgan } = await examSessionService.submitExam(scheduleId, answers, siswaId);

    winston.info(`Exam schedule ${scheduleId} submitted by Siswa ${req.user.username}`);

    res.json({
        status: 'success',
        message: 'Exam submitted successfully',
        scorePilgan
    });
  } catch (error) {
    winston.error(`Submitting exam failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
