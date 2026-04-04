import * as paketUjianRepository from '../repositories/paketUjianRepository.js';
import * as soalRepository from '../repositories/soalRepository.js';

export const createExamPackage = async (title, mapelId, guruId) => {
  return await paketUjianRepository.create({
    title,
    mapelId,
    guruId
  });
};

export const createQuestion = async (questionData, currentUser) => {
  const { paketUjianId } = questionData;
  const paketUjian = await paketUjianRepository.findById(paketUjianId);
  if (!paketUjian || paketUjian.guruId !== currentUser.id) {
    throw new Error('Forbidden');
  }

  return await soalRepository.create(questionData);
};

export const getBankSoal = async (query) => {
  const { mapelId, search } = query;
  const filters = {};
  if (mapelId) filters.paketUjian = { mapelId };
  if (search) filters.questionText = { contains: search };

  return await soalRepository.findAll(filters);
};

export const getMyPackages = async (guruId) => {
  return await paketUjianRepository.findAll({ guruId });
};

export const updateExamPackage = async (id, title, mapelId, currentUser) => {
  const existing = await paketUjianRepository.findById(id);
  if (!existing || existing.guruId !== currentUser.id) {
    throw new Error('Forbidden');
  }

  return await paketUjianRepository.update(id, { title, mapelId });
};

export const deleteExamPackage = async (id, currentUser) => {
  const existing = await paketUjianRepository.findById(id);
  if (!existing || existing.guruId !== currentUser.id) {
    throw new Error('Forbidden');
  }

  return await paketUjianRepository.deletePackage(id);
};

export const updateQuestion = async (id, questionData, currentUser) => {
  const existing = await soalRepository.findById(id);
  if (!existing || existing.paketUjian.guruId !== currentUser.id) {
    throw new Error('Forbidden');
  }

  return await soalRepository.update(id, questionData);
};

export const deleteQuestion = async (id, currentUser) => {
  const existing = await soalRepository.findById(id);
  if (!existing || existing.paketUjian.guruId !== currentUser.id) {
    throw new Error('Forbidden');
  }

  return await soalRepository.deleteSoal(id);
};
