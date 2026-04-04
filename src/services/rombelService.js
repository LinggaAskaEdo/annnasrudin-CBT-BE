import * as rombelRepository from '../repositories/rombelRepository.js';

export const createRombel = async (name) => {
  const existing = await rombelRepository.findByName(name);
  if (existing) {
    throw new Error('Nama rombel sudah ada');
  }

  return await rombelRepository.create({ name });
};

export const getAllRombels = async () => {
  return await rombelRepository.findAll();
};
