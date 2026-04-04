import prisma from '../config/prisma.js';

export const create = async (data) => {
  return await prisma.modul.create({
    data
  });
};

export const findAll = async (filters = {}) => {
  return await prisma.modul.findMany({
    where: filters,
    include: {
      guru: { select: { name: true } },
      rombel: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id) => {
  return await prisma.modul.findUnique({
    where: { id }
  });
};

export const updateModul = async (id, data) => {
  return await prisma.modul.update({
    where: { id },
    data
  });
};

export const deleteModul = async (id) => {
  return await prisma.modul.delete({
    where: { id }
  });
};
