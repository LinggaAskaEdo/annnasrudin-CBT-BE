import winston from '../utils/logger.js';
import Joi from 'joi';

const updateProfileSchema = Joi.object({
  password: Joi.string().min(6).optional(),
  name: Joi.string().optional(),
  jabatan: Joi.string().optional(),
  mapelIds: Joi.array().items(Joi.string().uuid()).optional()
});

class GuruController {
  constructor(guruService) {
    this.guruService = guruService;
  }

  updateProfile = async (req, res, next) => {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    try {
      const updatedUser = await this.guruService.updateProfile(req.user.id, req.body);
      winston.info(`Guru ${updatedUser.username} updated their profile`);
      res.json({
        status: 'success',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  getSiswa = async (req, res, next) => {
    try {
      const siswa = await this.guruService.getSiswa(req.query);
      res.json({
        status: 'success',
        data: siswa
      });
    } catch (error) {
      next(error);
    }
  };

  getSubmissionDetail = async (req, res, next) => {
    const { hasilUjianId } = req.params;

    try {
      const submission = await this.guruService.getSubmissionDetail(hasilUjianId);
      res.json({ status: 'success', data: submission });
    } catch (error) {
      next(error);
    }
  };

  gradeUraian = async (req, res, next) => {
    const { hasilUjianId } = req.params;
    const { uraianGrades } = req.body; // Array of { soalId, guruScore, feedback }

    try {
      const updated = await this.guruService.gradeUraian(hasilUjianId, uraianGrades, req.user);
      winston.info(`Guru ${req.user.username} graded submission: ${hasilUjianId}. Uraian Score: ${updated.scoreUraian}`);

      res.json({
        status: 'success',
        message: 'Grading updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  getExamResults = async (req, res, next) => {
    try {
      const results = await this.guruService.getExamResults(req.query);
      res.json({
        status: 'success',
        data: results
      });
    } catch (error) {
      next(error);
    }
  };
}

export default GuruController;
