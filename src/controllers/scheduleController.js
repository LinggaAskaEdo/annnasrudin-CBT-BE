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

/**
 * Guru updates an Exam Schedule.
 */
export const updateSchedule = async (req, res, next) => {
  const { id } = req.params;
  const { startTime, endTime, deadline, rombelId } = req.body;

  try {
    const existing = await prisma.jadwalUjian.findUnique({ 
        where: { id },
        include: { paketUjian: true }
    });

    if (!existing || existing.paketUjian.guruId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const updated = await prisma.jadwalUjian.update({
      where: { id },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        rombelId
      }
    });

    res.json({ status: 'success', data: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru deletes an Exam Schedule.
 */
export const deleteSchedule = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existing = await prisma.jadwalUjian.findUnique({ 
        where: { id },
        include: { paketUjian: true }
    });

    if (!existing || existing.paketUjian.guruId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    await prisma.jadwalUjian.delete({ where: { id } });

    res.json({ status: 'success', message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
