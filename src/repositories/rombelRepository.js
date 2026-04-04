import prisma from '../config/prisma.js';

export const findById = async (id) => {
  return await prisma.rombel.findUnique({
    where: { id }
  });
};

export const findByName = async (name) => {
  return await prisma.rombel.findUnique({
    where: { name }
  });
};

export const findAll = async () => {
  return await prisma.rombel.findMany({
    orderBy: { name: 'asc' }
  });
};

export const create = async (data) => {
  return await prisma.rombel.create({
    data
  });
};
