import winston from '../utils/logger.js';

class ExamSessionController {
  constructor(examSessionService) {
    this.examSessionService = examSessionService;
  }

  /**
   * Siswa starts an exam session.
   */
  startExam = async (req, res, next) => {
    const { scheduleId } = req.params;
    const siswaId = req.user.id;

    try {
      const { session, questions } = await this.examSessionService.startExam(scheduleId, siswaId);

      res.json({
        status: 'success',
        data: {
          session,
          questions
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Siswa submits their exam answers.
   * Auto-grades Pilihan Ganda (Pilgan).
   */
  submitExam = async (req, res, next) => {
    const { scheduleId } = req.params;
    const { answers } = req.body; // Array of { soalId, answer }
    const siswaId = req.user.id;

    try {
      const { scorePilgan } = await this.examSessionService.submitExam(scheduleId, answers, siswaId);

      winston.info(`Exam schedule ${scheduleId} submitted by Siswa ${req.user.username}`);

      res.json({
        status: 'success',
        message: 'Exam submitted successfully',
        scorePilgan
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ExamSessionController;
