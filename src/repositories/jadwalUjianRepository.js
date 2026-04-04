import prisma from '../config/prisma.js';

export const findAll = async (filters = {}) => {
  return await prisma.jadwalUjian.findMany({
    where: filters,
    include: {
      paketUjian: {
        include: {
          mapel: true,
          soals: true
        }
      },
      rombel: true
    },
    orderBy: { startTime: 'desc' }
  });
};

export const findById = async (id) => {
  return await prisma.jadwalUjian.findUnique({
    where: { id },
    include: {
      paketUjian: {
        include: {
          mapel: true,
          soals: true
        }
      },
      rombel: true
    }
  });
};

export const create = async (data) => {
  return await prisma.jadwalUjian.create({
    data
  });
};

export const update = async (id, data) => {
  return await prisma.jadwalUjian.update({
    where: { id },
    data
  });
};

export const deleteJadwal = async (id) => {
  return await prisma.jadwalUjian.delete({
    where: { id }
  });
};
