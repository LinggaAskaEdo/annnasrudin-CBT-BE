class MataPelajaranRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findAll = async () => {
    return await this.prisma.mataPelajaran.findMany({
      orderBy: { name: 'asc' }
    });
  };

  create = async (data) => {
    return await this.prisma.mataPelajaran.create({
      data
    });
  };

  findByName = async (name) => {
    return await this.prisma.mataPelajaran.findUnique({
      where: { name }
    });
  };

  findById = async (id) => {
    return await this.prisma.mataPelajaran.findUnique({
      where: { id }
    });
  };
}

export default MataPelajaranRepository;
