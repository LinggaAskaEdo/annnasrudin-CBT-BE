import * as moduleService from '../services/moduleService.js';
import winston from '../utils/logger.js';

export const createModule = async (req, res, next) => {
  const { title, rombelId } = req.body;
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const newModul = await moduleService.createModul(title, filePath, req.user.id, rombelId);

    winston.info(`Guru ${req.user.username} uploaded module ${title}`);

    res.status(201).json({
      status: 'success',
      data: newModul
    });
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (req, res, next) => {
  const { id } = req.params;
  const { title } = req.body;
  const filePath = req.file ? req.file.path : undefined;

  try {
    const updated = await moduleService.updateModul(id, title, filePath, req.user);
    res.json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const getMyModules = async (req, res, next) => {
  try {
    const modules = await moduleService.getMyModules(req.user.id);
    res.json({
      status: 'success',
      data: modules
    });
  } catch (error) {
    next(error);
  }
};

export const getModulesByRombel = async (req, res, next) => {
  try {
    const modules = await moduleService.getModules(req.query, req.user);
    res.json({
      status: 'success',
      data: modules
    });
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (req, res, next) => {
  const { id } = req.params;

  try {
    await moduleService.deleteModul(id, req.user);
    winston.info(`Module ${id} deleted by ${req.user.username}`);
    res.json({
      status: 'success',
      message: 'Module deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
