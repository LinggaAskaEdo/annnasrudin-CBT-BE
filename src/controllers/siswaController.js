import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/authUtils.js';
import winston from '../utils/logger.js';
import Joi from 'joi';

const prisma = new PrismaClient();

/**
 * Siswa updates their password.
 */
export const updateProfile = async (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ status: 'error', message: 'Password is required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Get modules assigned to the siswa's Rombel.
 */
export const getAvailableModules = async (req, res, next) => {
  try {
    const siswa = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { rombelId: true }
    });

    if (!siswa.rombelId) {
      return res.json({ status: 'success', data: [] });
    }

    const modules = await prisma.modul.findMany({
      where: { rombelId: siswa.rombelId },
      include: { guru: { select: { name: true } } }
    });

    res.json({ status: 'success', data: modules });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Get available exam schedules with status filters.
 */
export const getAvailableExams = async (req, res, next) => {
  try {
    const siswa = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { rombelId: true }
    });

    if (!siswa.rombelId) {
       return res.json({ status: 'success', data: [] });
    }

    const now = new Date();
    const schedules = await prisma.jadwalUjian.findMany({
      where: { rombelId: siswa.rombelId },
      include: {
        paketUjian: { select: { title: true, mapel: { select: { name: true } } } },
        hasilUjians: { where: { siswaId: req.user.id } }
      }
    });

    const exams = schedules.map(s => {
      let status = 'UPCOMING';
      if (s.hasilUjians.length > 0 && s.hasilUjians[0].status === 'COMPLETED') {
        status = 'COMPLETED';
      } else if (now > s.deadline) {
        status = 'EXPIRED';
      } else if (now >= s.startTime && now <= s.endTime) {
        status = 'AVAILABLE';
      }

      return {
        id: s.id,
        title: s.paketUjian.title,
        subject: s.paketUjian.mapel.name,
        startTime: s.startTime,
        endTime: s.endTime,
        deadline: s.deadline,
        status
      };
    });

    res.json({ status: 'success', data: exams });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * List history of results for the siswa.
 */
export const getResults = async (req, res, next) => {
  try {
    const results = await prisma.hasilUjian.findMany({
      where: { siswaId: req.user.id },
      include: {
        jadwalUjian: {
          include: { paketUjian: { select: { title: true, mapel: { select: { name: true } } } } }
        }
      }
    });

    res.json({ status: 'success', data: results });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Siswa views detailed results (including Uraian feedback).
 */
export const getResultDetail = async (req, res, next) => {
  const { hasilUjianId } = req.params;

  try {
    const result = await prisma.hasilUjian.findFirst({
        where: { id: hasilUjianId, siswaId: req.user.id },
        include: {
            jadwalUjian: {
                include: { paketUjian: { select: { title: true, mapel: { select: { name: true } } } } }
            }
        }
    });

    if (!result) return res.status(404).json({ status: 'error', message: 'Result not found' });

    res.json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
