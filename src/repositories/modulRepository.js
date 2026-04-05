class ModulRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create = async (data) => {
    return await this.prisma.modul.create({
      data
    });
  };

  findAll = async (filters = {}) => {
    return await this.prisma.modul.findMany({
      where: filters,
      include: {
        guru: { select: { name: true } },
        rombel: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  };

  findById = async (id) => {
    return await this.prisma.modul.findUnique({
      where: { id }
    });
  };

  updateModul = async (id, data) => {
    return await this.prisma.modul.update({
      where: { id },
      data
    });
  };

  deleteModul = async (id) => {
    return await this.prisma.modul.delete({
      where: { id }
    });
  };
}

export default ModulRepository;
