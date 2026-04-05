class JadwalUjianRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findAll = async (filters = {}) => {
    return await this.prisma.jadwalUjian.findMany({
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

  findById = async (id) => {
    return await this.prisma.jadwalUjian.findUnique({
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

  create = async (data) => {
    return await this.prisma.jadwalUjian.create({
      data
    });
  };

  update = async (id, data) => {
    return await this.prisma.jadwalUjian.update({
      where: { id },
      data
    });
  };

  deleteJadwal = async (id) => {
    return await this.prisma.jadwalUjian.delete({
      where: { id }
    });
  };
}

export default JadwalUjianRepository;
