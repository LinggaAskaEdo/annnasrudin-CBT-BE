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

    /**
     * Final Score Calculation: Simple sum of Pilgan (already in score) and manual Uraian points.
     * Use a fresh calculation to ensure accuracy.
     */
    let totalUraianScore = 0;
    updatedAnswers.forEach(ans => {
        if (ans.type === 'URAIAN') totalUraianScore += (ans.teacherScore || 0);
    });

    // We assume the current submission.score contains the correct Pilgan count (1 per correct answer)
    // To be safe, we could re-calculate Pilgan from answers if needed, but for now we follow the instruction:
    // "menjumlahkan total Pilihan Ganda (Pilgan) dengan Total Nilai Uraian"
    
    // However, submission.score was set during submitExam. 
    // We should probably preserve the Pilgan score and just add Uraian.
    // If gradeUraian is called multiple times, we need to be careful not to double count.
    
    // Better: Calculate total score from scratch based on updatedAnswers
    let totalScore = 0;
    const schedule = await prisma.jadwalUjian.findUnique({
        where: { id: submission.jadwalUjianId },
        include: { paketUjian: { include: { soals: true } } }
    });
    const questions = schedule.paketUjian.soals;

    updatedAnswers.forEach(ans => {
        const question = questions.find(q => q.id === ans.soalId);
        if (question && question.questionType === 'PILGAN' && question.correctAnswer === ans.answer) {
            totalScore += 1;
        } else if (ans.type === 'URAIAN') {
            totalScore += (ans.teacherScore || 0);
        }
    });

    // Update the record
    const updated = await prisma.hasilUjian.update({
        where: { id: hasilUjianId },
        data: {
            answers: updatedAnswers,
            score: totalScore
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
