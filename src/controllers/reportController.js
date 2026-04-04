import * as reportService from '../services/reportService.js';
import winston from '../utils/logger.js';

/**
 * Generates a JSON report for all siswa results in a specific exam schedule.
 */
export const getClassroomReport = async (req, res, next) => {
  const { scheduleId } = req.params;

  try {
    const reportData = await reportService.getClassroomReport(scheduleId);

    res.json({
      status: 'success',
      data: reportData
    });
  } catch (error) {
    winston.error(`Report generation failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
