import winston from '../utils/logger.js';

class ExamController {
  constructor(examService) {
    this.examService = examService;
  }

  createUjian = async (req, res, next) => {
    const { title, mapel } = req.body;
    
    try {
      const newUjian = await this.examService.createUjian(title, mapel, req.user);
      winston.info(`Ujian ${newUjian.title} berhasil dibuat oleh ${req.user.username}`);
      res.status(201).json({
        status: 'success',
        data: newUjian
      });
    } catch (error) {
      next(error);
    }
  };

  createSoal = async (req, res, next) => {
    try {
      const newSoal = await this.examService.createSoal(req.body, req.user);
      res.status(201).json({
        status: 'success',
        data: newSoal
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

  getUjianSaya = async (req, res, next) => {
    try {
      const ujians = await this.examService.getUjianSaya(req.user.id);
      res.json({ status: 'success', data: ujians });
    } catch (error) {
      next(error);
    }
  };

  updateUjian = async (req, res, next) => {
    const { id } = req.params;
    const { title, mapel } = req.body;

    try {
      const updated = await this.examService.updateUjian(id, title, mapel, req.user);
      res.json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteUjian = async (req, res, next) => {
    const { id } = req.params;

    try {
      await this.examService.deleteUjian(id, req.user);
      res.json({ status: 'success', message: 'Ujian dan soal-soalnya berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  };

  updateSoal = async (req, res, next) => {
    const { id } = req.params;

    try {
      const updated = await this.examService.updateSoal(id, req.body, req.user);
      res.json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteSoal = async (req, res, next) => {
    const { id } = req.params;

    try {
      await this.examService.deleteSoal(id, req.user);
      res.json({ status: 'success', message: 'Soal berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  };
}

export default ExamController;
