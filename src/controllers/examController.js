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
