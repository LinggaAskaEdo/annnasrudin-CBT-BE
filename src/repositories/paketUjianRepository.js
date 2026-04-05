class PaketUjianRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findById = async (id) => {
    return await this.prisma.paketUjian.findUnique({
      where: { id },
      include: {
        soals: true,
        mapel: { select: { name: true } }
      }
    });
  };

  findAll = async (filters = {}) => {
    return await this.prisma.paketUjian.findMany({
      where: filters,
      include: {
        soals: true,
        mapel: { select: { name: true } }
      }
    });
  };

  create = async (data) => {
    return await this.prisma.paketUjian.create({
      data
    });
  };

  update = async (id, data) => {
    return await this.prisma.paketUjian.update({
      where: { id },
      data
    });
  };

  deletePackage = async (id) => {
    // Manual cascading for soals
    await this.prisma.soal.deleteMany({ where: { paketUjianId: id } });
    return await this.prisma.paketUjian.delete({
      where: { id }
    });
  };
}

export default PaketUjianRepository;
