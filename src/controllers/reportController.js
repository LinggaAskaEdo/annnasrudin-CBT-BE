import { PrismaClient } from '@prisma/client';
import winston from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Generates a JSON report for all siswa results in a specific exam schedule.
 */
export const getClassroomReport = async (req, res, next) => {
  const { scheduleId } = req.params;

  try {
    const schedule = await prisma.jadwalUjian.findUnique({
      where: { id: scheduleId },
      include: {
        paketUjian: { select: { title: true, mapel: { select: { name: true } } } },
        rombel: { select: { name: true } },
        hasilUjians: {
            include: {
                siswa: { select: { name: true, username: true } }
            }
        }
      }
    });

    if (!schedule) return res.status(404).json({ status: 'error', message: 'Schedule not found' });

    /**
     * The report displays independent scores for Pilihan Ganda and Uraian.
     */

    const processedResults = schedule.hasilUjians.map(h => {
        return {
            siswaName: h.siswa.name,
            username: h.siswa.username,
            scorePilgan: h.scorePilgan,
            scoreUraian: h.scoreUraian,
            status: h.status,
            submittedAt: h.updatedAt
        };
    });

    res.json({
      status: 'success',
      data: {
        examTitle: schedule.paketUjian.title,
        subject: schedule.paketUjian.mapel.name,
        rombel: schedule.rombel.name,
        results: processedResults
      }
    });
  } catch (error) {
    winston.error(`Report generation failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
