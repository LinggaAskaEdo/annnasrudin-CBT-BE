import * as guruService from '../services/guruService.js';
import winston from '../utils/logger.js';
import Joi from 'joi';

const updateProfileSchema = Joi.object({
  password: Joi.string().min(6).optional(),
  name: Joi.string().optional(),
  jabatan: Joi.string().optional(),
  mapelIds: Joi.array().items(Joi.string().uuid()).optional()
});

export const updateProfile = async (req, res, next) => {
  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }

  try {
    const updatedUser = await guruService.updateProfile(req.user.id, req.body);
    winston.info(`Guru ${updatedUser.username} updated their profile`);
    res.json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    winston.error(`Profile update failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getSiswa = async (req, res, next) => {
  try {
    const siswa = await guruService.getSiswa(req.query);
    res.json({
      status: 'success',
      data: siswa
    });
  } catch (error) {
    winston.error(`Fetching siswa failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getSubmissionDetail = async (req, res, next) => {
  const { hasilUjianId } = req.params;

  try {
    const submission = await guruService.getSubmissionDetail(hasilUjianId);
    res.json({ status: 'success', data: submission });
  } catch (error) {
    winston.error(`Fetching submission detail failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const gradeUraian = async (req, res, next) => {
  const { hasilUjianId } = req.params;
  const { uraianGrades } = req.body; // Array of { soalId, guruScore, feedback }

  try {
    const updated = await guruService.gradeUraian(hasilUjianId, uraianGrades, req.user);
    winston.info(`Guru ${req.user.username} graded submission: ${hasilUjianId}. Uraian Score: ${updated.scoreUraian}`);

    res.json({
      status: 'success',
      message: 'Grading updated successfully',
      data: updated
    });
  } catch (error) {
    winston.error(`Grading failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getExamResults = async (req, res, next) => {
  try {
    const results = await guruService.getExamResults(req.query);
    res.json({
      status: 'success',
      data: results
    });
  } catch (error) {
    winston.error(`Fetching results failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
