import * as scheduleService from '../services/scheduleService.js';
import winston from '../utils/logger.js';

export const scheduleExam = async (req, res, next) => {
  try {
    const newSchedule = await scheduleService.createSchedule(req.body, req.user);
    winston.info(`CBT Schedule created for ${newSchedule.paketUjianId} to Rombel ${req.body.rombelId}`);
    res.status(201).json({
      status: 'success',
      data: newSchedule
    });
  } catch (error) {
    next(error);
  }
};

export const getMySchedules = async (req, res, next) => {
  try {
    const schedules = await scheduleService.getMySchedules(req.user);
    res.json({ status: 'success', data: schedules });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  const { id } = req.params;

  try {
    const updated = await scheduleService.updateSchedule(id, req.body, req.user);
    res.json({ status: 'success', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  const { id } = req.params;

  try {
    await scheduleService.deleteSchedule(id, req.user);
    res.json({ status: 'success', message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};
