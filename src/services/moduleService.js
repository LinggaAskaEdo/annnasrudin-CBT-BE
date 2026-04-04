import * as modulRepository from '../repositories/modulRepository.js';

export const createModul = async (title, filePath, guruId, rombelId) => {
  return await modulRepository.create({
    title,
    filePath,
    guruId,
    rombelId
  });
};

export const getModules = async (query, currentUser) => {
  const { rombelId } = query;
  const filters = {};
  if (rombelId) filters.rombelId = rombelId;

  // Filter based on user role (Guru can see all within filter, Siswa can see only their rombel)
  if (currentUser.role === 'SISWA') {
    filters.rombelId = currentUser.rombelId;
  }

  return await modulRepository.findAll(filters);
};

export const getMyModules = async (guruId) => {
  return await modulRepository.findAll({ guruId });
};

export const updateModul = async (id, title, filePath, currentUser) => {
  const modul = await modulRepository.findById(id);
  if (!modul) throw new Error('Modul tidak ditemukan');

  if (modul.guruId !== currentUser.id && currentUser.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  return await modulRepository.updateModul(id, { title, filePath });
};

export const deleteModul = async (id, currentUser) => {
  const modul = await modulRepository.findById(id);
  if (!modul) throw new Error('Modul tidak ditemukan');

  // Only the guru who created can delete
  if (modul.guruId !== currentUser.id && currentUser.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  return await modulRepository.deleteModul(id);
};
