import winston from '../utils/logger.js';

class ModuleController {
  constructor(moduleService) {
    this.moduleService = moduleService;
  }

  createModule = async (req, res, next) => {
    const { title, rombelId } = req.body;
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    try {
      const filePath = req.file.path;
      const newModul = await this.moduleService.createModul(title, filePath, req.user.id, rombelId);

      winston.info(`Guru ${req.user.username} uploaded module ${title}`);

      res.status(201).json({
        status: 'success',
        data: newModul
      });
    } catch (error) {
      next(error);
    }
  };

  updateModule = async (req, res, next) => {
    const { id } = req.params;
    const { title } = req.body;
    const filePath = req.file ? req.file.path : undefined;

    try {
      const updated = await this.moduleService.updateModul(id, title, filePath, req.user);
      res.json({
        status: 'success',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  getMyModules = async (req, res, next) => {
    try {
      const modules = await this.moduleService.getMyModules(req.user.id);
      res.json({
        status: 'success',
        data: modules
      });
    } catch (error) {
      next(error);
    }
  };

  getModulesByRombel = async (req, res, next) => {
    try {
      const modules = await this.moduleService.getModules(req.query, req.user);
      res.json({
        status: 'success',
        data: modules
      });
    } catch (error) {
      next(error);
    }
  };

  deleteModule = async (req, res, next) => {
    const { id } = req.params;

    try {
      await this.moduleService.deleteModul(id, req.user);
      winston.info(`Module ${id} deleted by ${req.user.username}`);
      res.json({
        status: 'success',
        message: 'Module deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ModuleController;
