class UjianRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findById = async (id) => {
    return await this.prisma.ujian.findUnique({
      where: { id },
      include: {
        soals: true
      }
    });
  };

  findAll = async (filters = {}) => {
    return await this.prisma.ujian.findMany({
      where: filters,
      include: {
        soals: true
      }
    });
  };

  create = async (data) => {
    return await this.prisma.ujian.create({
      data
    });
  };

  update = async (id, data) => {
    return await this.prisma.ujian.update({
      where: { id },
      data
    });
  };

  deleteUjian = async (id) => {
    // Manual cascading for soals
    await this.prisma.soal.deleteMany({ where: { ujianId: id } });
    return await this.prisma.ujian.delete({
      where: { id }
    });
  };
}

export default UjianRepository;
