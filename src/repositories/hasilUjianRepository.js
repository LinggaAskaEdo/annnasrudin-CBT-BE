class HasilUjianRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findActiveSession = async (siswaId, jadwalUjianId) => {
    return await this.prisma.hasilUjian.findFirst({
      where: {
        siswaId,
        jadwalUjianId,
        status: 'ONGOING'
      }
    });
  };

  create = async (data) => {
    return await this.prisma.hasilUjian.create({
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

  findById = async (id) => {
    return await this.prisma.hasilUjian.findUnique({
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

  findByFilters = async (filters = {}) => {
    return await this.prisma.hasilUjian.findMany({
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

  update = async (id, data) => {
    return await this.prisma.hasilUjian.update({
      where: { id },
      data
    });
  };
}

export default HasilUjianRepository;
