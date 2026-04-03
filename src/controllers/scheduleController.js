import { PrismaClient } from '@prisma/client';
import winston from '../utils/logger.js';
import Joi from 'joi';

const prisma = new PrismaClient();

/**
 * Schedule an exam package for a Rombel.
 */
export const scheduleExam = async (req, res, next) => {
  const { paketUjianId, rombelId, startTime, endTime, deadline } = req.body;
  
  try {
    const paketUjian = await prisma.paketUjian.findUnique({ where: { id: paketUjianId } });
    if (!paketUjian || paketUjian.guruId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const newSchedule = await prisma.jadwalUjian.create({
      data: {
        paketUjianId,
        rombelId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        deadline: new Date(deadline)
      }
    });

    winston.info(`CBT Schedule created for ${newSchedule.paketUjianId} to Rombel ${rombelId}`);

    res.status(201).json({
      status: 'success',
      data: newSchedule
    });
  } catch (error) {
    winston.error(`Exam scheduling failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru lists all schedules created by them.
 */
export const getMySchedules = async (req, res, next) => {
  try {
    const schedules = await prisma.jadwalUjian.findMany({
      where: { paketUjian: { guruId: req.user.id } },
      include: {
        paketUjian: { select: { title: true } },
        rombel: { select: { name: true } }
      }
    });
    res.json({ status: 'success', data: schedules });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
