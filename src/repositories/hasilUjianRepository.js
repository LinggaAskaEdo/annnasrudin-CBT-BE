import prisma from '../config/prisma.js';

export const findActiveSession = async (siswaId, jadwalUjianId) => {
  return await prisma.hasilUjian.findFirst({
    where: {
      siswaId,
      jadwalUjianId,
      status: 'ONGOING'
    }
  });
};

export const create = async (data) => {
  return await prisma.hasilUjian.create({
    data,
    include: {
      jadwalUjian: {
        include: {
          paketUjian: {
            include: {
              soals: true
            }
          }
        }
      }
    }
  });
};

export const findById = async (id) => {
  return await prisma.hasilUjian.findUnique({
    where: { id },
    include: {
      siswa: true,
      jadwalUjian: {
        include: {
          paketUjian: {
            include: {
              mapel: true,
              soals: true
            }
          }
        }
      }
    }
  });
};

export const findByFilters = async (filters = {}) => {
  return await prisma.hasilUjian.findMany({
    where: filters,
    include: {
      siswa: {
        select: {
          name: true,
          username: true,
          rombel: { select: { name: true } }
        }
      },
      jadwalUjian: {
        include: {
          paketUjian: { select: { title: true, mapel: { select: { name: true } } } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const update = async (id, data) => {
  return await prisma.hasilUjian.update({
    where: { id },
    data
  });
};
