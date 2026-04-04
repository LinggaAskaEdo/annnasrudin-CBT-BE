import prisma from '../config/prisma.js';

export const create = async (data) => {
  return await prisma.soal.create({
    data
  });
};

export const findById = async (id) => {
  return await prisma.soal.findUnique({
    where: { id },
    include: { paketUjian: true }
  });
};

export const findAll = async (filters = {}) => {
  return await prisma.soal.findMany({
    where: filters,
    include: {
      paketUjian: {
        include: {
          guru: { select: { name: true } },
          mapel: { select: { name: true } }
        }
      }
    }
  });
};

export const update = async (id, data) => {
  return await prisma.soal.update({
    where: { id },
    data
  });
};

export const deleteSoal = async (id) => {
  return await prisma.soal.delete({
    where: { id }
  });
};
