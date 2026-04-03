import { PrismaClient } from '@prisma/client';
import winston from '../utils/logger.js';
import Joi from 'joi';

const prisma = new PrismaClient();

/**
 * Handle creation of Exam Packages (Paket Ujian).
 */
export const createExamPackage = async (req, res, next) => {
  const { title, mapelId } = req.body;
  
  try {
    const newPackage = await prisma.paketUjian.create({
      data: {
        title,
        mapelId,
        guruId: req.user.id
      }
    });

    winston.info(`Exam Package ${newPackage.title} created by Guru ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      data: newPackage
    });
  } catch (error) {
    winston.error(`Exam Package creation failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Handle creation of Individual Questions (Soal) in a package.
 */
export const createQuestion = async (req, res, next) => {
  const { paketUjianId, questionType, questionText, options, correctAnswer } = req.body;
  
  try {
    const paketUjian = await prisma.paketUjian.findUnique({ where: { id: paketUjianId } });
    if (!paketUjian || paketUjian.guruId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const newQuestion = await prisma.soal.create({
      data: {
        paketUjianId,
        questionType, // PILGAN or URAIAN
        questionText,
        options, // JSON array of options
        correctAnswer
      }
    });

    res.status(201).json({
      status: 'success',
      data: newQuestion
    });
  } catch (error) {
    winston.error(`Question creation failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Bank Soal: Retrive all questions from all gurus.
 */
export const getBankSoal = async (req, res, next) => {
  const { mapelId, search } = req.query;
  
  try {
    const filters = {};
    if (mapelId) filters.paketUjian = { mapelId };
    if (search) filters.questionText = { contains: search };

    const bank = await prisma.soal.findMany({
      where: filters,
      include: {
        paketUjian: {
          include: {
              guru: { select: { name: true } },
              mapel: { select: { name: true } }
          }
        }
      }
    });

    res.json({
      status: 'success',
      data: bank
    });
  } catch (error) {
    winston.error(`Bank Soal retrieval failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Get all packages created by the current Guru.
 */
export const getMyPackages = async (req, res, next) => {
  try {
    const packages = await prisma.paketUjian.findMany({
      where: { guruId: req.user.id },
      include: { 
        soals: true,
        mapel: { select: { name: true } }
      }
    });
    res.json({ status: 'success', data: packages });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru updates an Exam Package title or subject.
 */
export const updateExamPackage = async (req, res, next) => {
  const { id } = req.params;
  const { title, mapelId } = req.body;

  try {
    const existing = await prisma.paketUjian.findUnique({ where: { id } });
    if (!existing || existing.guruId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const updated = await prisma.paketUjian.update({
      where: { id },
      data: { title, mapelId }
    });

    res.json({ status: 'success', data: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru deletes an Exam Package and its questions.
 */
export const deleteExamPackage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existing = await prisma.paketUjian.findUnique({ where: { id } });
    if (!existing || existing.guruId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    // Prisma handles cascading deletes if configured in schema, 
    // but here we manually delete Soals first to be safe if not.
    await prisma.soal.deleteMany({ where: { paketUjianId: id } });
    await prisma.paketUjian.delete({ where: { id } });

    res.json({ status: 'success', message: 'Exam package and its questions deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru updates an individual Question.
 */
export const updateQuestion = async (req, res, next) => {
  const { id } = req.params;
  const { questionType, questionText, options, correctAnswer } = req.body;

  try {
    const existing = await prisma.soal.findUnique({ 
        where: { id },
        include: { paketUjian: true }
    });

    if (!existing || existing.paketUjian.guruId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const updated = await prisma.soal.update({
      where: { id },
      data: { questionType, questionText, options, correctAnswer }
    });

    res.json({ status: 'success', data: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru deletes an individual Question.
 */
export const deleteQuestion = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existing = await prisma.soal.findUnique({ 
        where: { id },
        include: { paketUjian: true }
    });

    if (!existing || existing.paketUjian.guruId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    await prisma.soal.delete({ where: { id } });

    res.json({ status: 'success', message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
