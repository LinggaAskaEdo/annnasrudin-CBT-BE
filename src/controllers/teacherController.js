import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/authUtils.js';
import winston from '../utils/logger.js';
import Joi from 'joi';

const prisma = new PrismaClient();

const updateProfileSchema = Joi.object({
  password: Joi.string().min(6).optional(),
  name: Joi.string().optional(),
  jabatan: Joi.string().optional(),
  mapelIds: Joi.array().items(Joi.string().uuid()).optional()
});

/**
 * Guru updates their own profile.
 */
export const updateProfile = async (req, res, next) => {
  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }

  const { password, name, jabatan, mapelIds } = req.body;
  const userId = req.user.id;

  try {
    const updateData = {};
    if (password) updateData.password = await hashPassword(password);
    if (name) updateData.name = name;
    if (jabatan) updateData.jabatan = jabatan;
    
    // Many-to-many update for instructedMapels
    if (mapelIds) {
      updateData.instructedMapels = {
        set: mapelIds.map(id => ({ id }))
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        jabatan: true,
        instructedMapels: true
      }
    });

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

/**
 * Lists all students with ROMBEL filter and search.
 */
export const getStudents = async (req, res, next) => {
  const { rombelId, search } = req.query;

  try {
    const filters = { role: 'SISWA' };
    if (rombelId) filters.rombelId = rombelId;
    if (search) {
      filters.OR = [
        { name: { contains: search } },
        { username: { contains: search } }
      ];
    }

    const students = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        username: true,
        name: true,
        rombel: true,
        createdAt: true
      }
    });

    res.json({
      status: 'success',
      data: students
    });
  } catch (error) {
    winston.error(`Fetching students failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Guru gets a specific student submission to grade.
 */
export const getSubmissionDetail = async (req, res, next) => {
  const { hasilUjianId } = req.params;

  try {
    const submission = await prisma.hasilUjian.findUnique({
      where: { id: hasilUjianId },
      include: {
        siswa: { select: { name: true, rombel: { select: { name: true } } } },
        jadwalUjian: { include: { paketUjian: { select: { title: true } } } }
      }
    });

    if (!submission) return res.status(404).json({ status: 'error', message: 'Submission not found' });

    res.json({ status: 'success', data: submission });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru grades Uraian questions with score and feedback.
 */
export const gradeUraian = async (req, res, next) => {
  const { hasilUjianId } = req.params;
  const { uraianGrades } = req.body; // Array of { soalId, teacherScore, feedback }

  try {
    const submission = await prisma.hasilUjian.findUnique({
      where: { id: hasilUjianId }
    });

    if (!submission) return res.status(404).json({ status: 'error', message: 'Submission not found' });

    const updatedAnswers = Array.from(submission.answers).map(ans => {
        const grade = uraianGrades.find(g => g.soalId === ans.soalId);
        if (grade && ans.type === 'URAIAN') {
            return {
                ...ans,
                teacherScore: grade.teacherScore,
                feedback: grade.feedback
            };
        }
        return ans;
    });

    // Final Score Calculation: Independent sum of Pilgan (already in score) and manual Uraian
    // For now, we update the existing score with the additional points or maintain independent stats.
    /**
     * NOTE FOR FUTURE DEVELOPMENT (Weighting System):
     * Currently, the total score is simply an aggregate of correct Pilgan.
     * In future iterations, implement a weighted average: (pilganScore * 0.6) + (uraianScore * 0.4).
     */
    let totalManualScore = 0;
    uraianGrades.forEach(g => { totalManualScore += (g.teacherScore || 0); });

    // Update the record
    const updated = await prisma.hasilUjian.update({
        where: { id: hasilUjianId },
        data: {
            answers: updatedAnswers,
            // score can be updated here to reflect the new total if needed, or keep it as is.
            // For this project, we'll keep the auto-graded score and let Guru append the Uraian points.
        }
    });

    winston.info(`Guru ${req.user.username} graded submission: ${hasilUjianId}. Total Manual Score added: ${totalManualScore}`);

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

/**
 * View exam results for students of their rombel.
 */
export const getExamResults = async (req, res, next) => {
  const { rombelId, jadwalUjianId } = req.query;

  try {
    const filters = {};
    if (rombelId) filters.siswa = { rombelId };
    if (jadwalUjianId) filters.jadwalUjianId = jadwalUjianId;

    const results = await prisma.hasilUjian.findMany({
      where: filters,
      include: {
        siswa: { select: { name: true, rombel: true } },
        jadwalUjian: { include: { paketUjian: { select: { title: true } } } }
      }
    });

    res.json({
      status: 'success',
      results
    });
  } catch (error) {
    winston.error(`Fetching results failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
