import prisma from '../config/prisma.js';

export const findAll = async () => {
  return await prisma.mataPelajaran.findMany({
    orderBy: { name: 'asc' }
  });
};

export const create = async (data) => {
  return await prisma.mataPelajaran.create({
    data
  });
};

export const findByName = async (name) => {
  return await prisma.mataPelajaran.findUnique({
    where: { name }
  });
};

export const findById = async (id) => {
  return await prisma.mataPelajaran.findUnique({
    where: { id }
  });
};
