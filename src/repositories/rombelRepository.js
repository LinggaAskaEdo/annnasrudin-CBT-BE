class RombelRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findById = async (id) => {
    return await this.prisma.rombel.findUnique({
      where: { id }
    });
  };

  findByName = async (name) => {
    return await this.prisma.rombel.findUnique({
      where: { name }
    });
  };

  findAll = async () => {
    return await this.prisma.rombel.findMany({
      orderBy: { name: 'asc' }
    });
  };

  create = async (data) => {
    return await this.prisma.rombel.create({
      data
    });
  };
}

export default RombelRepository;
