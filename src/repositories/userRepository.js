class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findById = async (id) => {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        rombel: true
      }
    });
  };

  findByUsername = async (username) => {
    return await this.prisma.user.findUnique({
      where: { username }
    });
  };

  findAll = async (filters = {}) => {
    return await this.prisma.user.findMany({
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

  create = async (data) => {
    return await this.prisma.user.create({
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

  update = async (id, data) => {
    return await this.prisma.user.update({
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

  deleteUser = async (id) => {
    return await this.prisma.user.delete({
      where: { id }
    });
  };
}

export default UserRepository;
