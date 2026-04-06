class SoalRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create = async (data) => {
    return await this.prisma.soal.create({
      data
    });
  };

  findById = async (id) => {
    return await this.prisma.soal.findUnique({
      where: { id },
      include: { ujian: true }
    });
  };

  findAll = async (filters = {}) => {
    return await this.prisma.soal.findMany({
      where: filters,
      include: {
        ujian: {
          include: {
            createdBy: { select: { name: true } }
          }
        }
      }
    });
  };

  update = async (id, data) => {
    return await this.prisma.soal.update({
      where: { id },
      data
    });
  };

  deleteSoal = async (id) => {
    return await this.prisma.soal.delete({
      where: { id }
    });
  };
}

export default SoalRepository;
