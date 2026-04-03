import { PrismaClient } from '@prisma/client';
import winston from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Generates a JSON report for all student results in a specific exam schedule.
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
     * NOTE FOR FUTURE DEVELOPMENT (Weighting System):
     * The report currently displays the auto-graded score.
     * Future reporting should include the aggregated (Pilgan + Weighted Uraian) total score.
     */

    const processedResults = schedule.hasilUjians.map(h => {
        let uraianPoints = 0;
        if (Array.isArray(h.answers)) {
            h.answers.forEach(ans => {
                if (ans.type === 'URAIAN') uraianPoints += (ans.teacherScore || 0);
            });
        }

        return {
            studentName: h.siswa.name,
            username: h.siswa.username,
            autoScore: h.score,
            uraianTotalPoints: uraianPoints,
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
