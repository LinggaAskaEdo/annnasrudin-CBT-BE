class ModuleService {
  constructor(modulRepository) {
    this.modulRepository = modulRepository;
  }

  createModul = async (title, filePath, guruId, rombelId) => {
    return await this.modulRepository.create({
      title,
      filePath,
      guruId,
      rombelId
    });
  };

  getModules = async (query, currentUser) => {
    const { rombelId } = query;
    const filters = {};
    if (rombelId) filters.rombelId = rombelId;

    // Filter based on user role (Guru can see all within filter, Siswa can see only their rombel)
    if (currentUser.role === 'SISWA') {
      filters.rombelId = currentUser.rombelId;
    }

    return await this.modulRepository.findAll(filters);
  };

  getMyModules = async (guruId) => {
    return await this.modulRepository.findAll({ guruId });
  };

  updateModul = async (id, title, filePath, currentUser) => {
    const modul = await this.modulRepository.findById(id);
    if (!modul) throw new Error('Modul tidak ditemukan');

    if (modul.guruId !== currentUser.id && currentUser.role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    return await this.modulRepository.updateModul(id, { title, filePath });
  };

  deleteModul = async (id, currentUser) => {
    const modul = await this.modulRepository.findById(id);
    if (!modul) throw new Error('Modul tidak ditemukan');

    // Only the guru who created can delete
    if (modul.guruId !== currentUser.id && currentUser.role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    return await this.modulRepository.deleteModul(id);
  };
}

export default ModuleService;
