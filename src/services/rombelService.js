class RombelService {
  constructor(rombelRepository) {
    this.rombelRepository = rombelRepository;
  }

  createRombel = async (name) => {
    const existing = await this.rombelRepository.findByName(name);
    if (existing) {
      throw new Error('Nama rombel sudah ada');
    }

    return await this.rombelRepository.create({ name });
  };

  getAllRombels = async () => {
    return await this.rombelRepository.findAll();
  };
}

export default RombelService;
