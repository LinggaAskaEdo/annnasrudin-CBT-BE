import * as examService from '../services/examService.js';
import winston from '../utils/logger.js';

export const createExamPackage = async (req, res, next) => {
  const { title, mapelId } = req.body;
  
  try {
    const newPackage = await examService.createExamPackage(title, mapelId, req.user.id);
    winston.info(`Exam Package ${newPackage.title} created by Guru ${req.user.username}`);
    res.status(201).json({
      status: 'success',
      data: newPackage
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const newQuestion = await examService.createQuestion(req.body, req.user);
    res.status(201).json({
      status: 'success',
      data: newQuestion
    });
  } catch (error) {
    next(error);
  }
};

export const getBankSoal = async (req, res, next) => {
  try {
    const bank = await examService.getBankSoal(req.query);
    res.json({
      status: 'success',
      data: bank
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPackages = async (req, res, next) => {
  try {
    const packages = await examService.getMyPackages(req.user.id);
    res.json({ status: 'success', data: packages });
  } catch (error) {
    next(error);
  }
};

export const updateExamPackage = async (req, res, next) => {
  const { id } = req.params;
  const { title, mapelId } = req.body;

  try {
    const updated = await examService.updateExamPackage(id, title, mapelId, req.user);
    res.json({ status: 'success', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteExamPackage = async (req, res, next) => {
  const { id } = req.params;

  try {
    await examService.deleteExamPackage(id, req.user);
    res.json({ status: 'success', message: 'Exam package and its questions deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  const { id } = req.params;

  try {
    const updated = await examService.updateQuestion(id, req.body, req.user);
    res.json({ status: 'success', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  const { id } = req.params;

  try {
    await examService.deleteQuestion(id, req.user);
    res.json({ status: 'success', message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};
