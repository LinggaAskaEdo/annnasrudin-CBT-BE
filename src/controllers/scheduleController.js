import winston from '../utils/logger.js';

class ScheduleController {
  constructor(scheduleService) {
    this.scheduleService = scheduleService;
  }

  scheduleExam = async (req, res, next) => {
    try {
      const newSchedule = await this.scheduleService.createSchedule(req.body, req.user);
      winston.info(`CBT Schedule created for ${newSchedule.paketUjianId} to Rombel ${req.body.rombelId}`);
      res.status(201).json({
        status: 'success',
        data: newSchedule
      });
    } catch (error) {
      next(error);
    }
  };

  getMySchedules = async (req, res, next) => {
    try {
      const schedules = await this.scheduleService.getMySchedules(req.user);
      res.json({ status: 'success', data: schedules });
    } catch (error) {
      next(error);
    }
  };

  updateSchedule = async (req, res, next) => {
    const { id } = req.params;

    try {
      const updated = await this.scheduleService.updateSchedule(id, req.body, req.user);
      res.json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteSchedule = async (req, res, next) => {
    const { id } = req.params;

    try {
      await this.scheduleService.deleteSchedule(id, req.user);
      res.json({ status: 'success', message: 'Schedule deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default ScheduleController;
