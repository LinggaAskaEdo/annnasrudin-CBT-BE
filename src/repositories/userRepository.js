import prisma from '../config/prisma.js';

export const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      rombel: true
    }
  });
};

export const findByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username }
  });
};

export const findAll = async (filters = {}) => {
  return await prisma.user.findMany({
    where: filters,
    select: {
      id: true,
      username: true,
      password: true,
      name: true,
      role: true,
      jabatan: true,
      rombelId: true,
      rombel: {
        select: {
          name: true
        }
      },
      createdAt: true
    }
  });
};

export const create = async (data) => {
  return await prisma.user.create({
    data,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true
    }
  });
};

export const update = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true
    }
  });
};

export const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id }
  });
};
