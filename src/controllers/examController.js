import winston from '../utils/logger.js';

class ExamController {
  constructor(examService) {
    this.examService = examService;
  }

  createExamPackage = async (req, res, next) => {
    const { title, mapelId } = req.body;
    
    try {
      const newPackage = await this.examService.createExamPackage(title, mapelId, req.user.id);
      winston.info(`Exam Package ${newPackage.title} created by Guru ${req.user.username}`);
      res.status(201).json({
        status: 'success',
        data: newPackage
      });
    } catch (error) {
      next(error);
    }
  };

  createQuestion = async (req, res, next) => {
    try {
      const newQuestion = await this.examService.createQuestion(req.body, req.user);
      res.status(201).json({
        status: 'success',
        data: newQuestion
      });
    } catch (error) {
      next(error);
    }
  };

  getBankSoal = async (req, res, next) => {
    try {
      const bank = await this.examService.getBankSoal(req.query);
      res.json({
        status: 'success',
        data: bank
      });
    } catch (error) {
      next(error);
    }
  };

  getMyPackages = async (req, res, next) => {
    try {
      const packages = await this.examService.getMyPackages(req.user.id);
      res.json({ status: 'success', data: packages });
    } catch (error) {
      next(error);
    }
  };

  updateExamPackage = async (req, res, next) => {
    const { id } = req.params;
    const { title, mapelId } = req.body;

    try {
      const updated = await this.examService.updateExamPackage(id, title, mapelId, req.user);
      res.json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteExamPackage = async (req, res, next) => {
    const { id } = req.params;

    try {
      await this.examService.deleteExamPackage(id, req.user);
      res.json({ status: 'success', message: 'Exam package and its questions deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  updateQuestion = async (req, res, next) => {
    const { id } = req.params;

    try {
      const updated = await this.examService.updateQuestion(id, req.body, req.user);
      res.json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteQuestion = async (req, res, next) => {
    const { id } = req.params;

    try {
      await this.examService.deleteQuestion(id, req.user);
      res.json({ status: 'success', message: 'Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default ExamController;
