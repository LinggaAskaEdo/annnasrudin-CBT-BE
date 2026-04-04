import prisma from '../config/prisma.js';

export const findById = async (id) => {
  return await prisma.paketUjian.findUnique({
    where: { id },
    include: {
        soals: true,
        mapel: { select: { name: true } }
    }
  });
};

export const findAll = async (filters = {}) => {
  return await prisma.paketUjian.findMany({
    where: filters,
    include: {
      soals: true,
      mapel: { select: { name: true } }
    }
  });
};

export const create = async (data) => {
  return await prisma.paketUjian.create({
    data
  });
};

export const update = async (id, data) => {
  return await prisma.paketUjian.update({
    where: { id },
    data
  });
};

export const deletePackage = async (id) => {
    // Manual cascading for soals
    await prisma.soal.deleteMany({ where: { paketUjianId: id } });
    return await prisma.paketUjian.delete({
        where: { id }
    });
};
