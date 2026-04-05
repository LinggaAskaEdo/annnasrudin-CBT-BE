import * as siswaService from '../services/siswaService.js';

export const updateProfile = async (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ status: 'error', message: 'Password is required' });
  }

  try {
    await siswaService.updateProfile(req.user.id, password);
    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAvailableModules = async (req, res, next) => {
  try {
    const modules = await siswaService.getAvailableModules(req.user.id);
    res.json({ status: 'success', data: modules });
  } catch (error) {
    next(error);
  }
};

export const getAvailableExams = async (req, res, next) => {
  try {
    const exams = await siswaService.getAvailableExams(req.user.id);
    res.json({ status: 'success', data: exams });
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const results = await siswaService.getResults(req.user.id);
    res.json({ status: 'success', data: results });
  } catch (error) {
    next(error);
  }
};

export const getResultDetail = async (req, res, next) => {
  const { hasilUjianId } = req.params;

  try {
    const result = await siswaService.getResultDetail(hasilUjianId, req.user.id);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
