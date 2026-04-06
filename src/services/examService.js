class ExamService {
  constructor(ujianRepository, soalRepository) {
    this.ujianRepository = ujianRepository;
    this.soalRepository = soalRepository;
  }

  // Only GURU and ADMIN can create Ujian
  createUjian = async (title, mapel, currentUser) => {
    if (currentUser.role !== 'GURU' && currentUser.role !== 'ADMIN') throw new Error('Forbidden');

    return await this.ujianRepository.create({
      title,
      mapel,
      createdById: currentUser.id
    });
  };

  createSoal = async (questionData, currentUser) => {
    if (currentUser.role !== 'GURU' && currentUser.role !== 'ADMIN') throw new Error('Forbidden');

    const { ujianId } = questionData;
    const ujian = await this.ujianRepository.findById(ujianId);
    if (!ujian || (ujian.createdById !== currentUser.id && currentUser.role !== 'ADMIN')) {
      throw new Error('Forbidden');
    }

    return await this.soalRepository.create(questionData);
  };

  getBankSoal = async (query) => {
    const { mapel, search } = query;
    const filters = {};
    if (mapel) filters.ujian = { mapel: { contains: mapel } };
    if (search) filters.questionText = { contains: search };

    return await this.soalRepository.findAll(filters);
  };

  getUjianSaya = async (userId) => {
    return await this.ujianRepository.findAll({ createdById: userId });
  };

  updateUjian = async (id, title, mapel, currentUser) => {
    const existing = await this.ujianRepository.findById(id);
    if (!existing || (existing.createdById !== currentUser.id && currentUser.role !== 'ADMIN')) {
      throw new Error('Forbidden');
    }

    return await this.ujianRepository.update(id, { title, mapel });
  };

  deleteUjian = async (id, currentUser) => {
    const existing = await this.ujianRepository.findById(id);
    if (!existing || (existing.createdById !== currentUser.id && currentUser.role !== 'ADMIN')) {
      throw new Error('Forbidden');
    }

    return await this.ujianRepository.deleteUjian(id);
  };

  updateSoal = async (id, questionData, currentUser) => {
    const existing = await this.soalRepository.findById(id);
    if (!existing || (existing.ujian.createdById !== currentUser.id && currentUser.role !== 'ADMIN')) {
      throw new Error('Forbidden');
    }

    return await this.soalRepository.update(id, questionData);
  };

  deleteSoal = async (id, currentUser) => {
    const existing = await this.soalRepository.findById(id);
    if (!existing || (existing.ujian.createdById !== currentUser.id && currentUser.role !== 'ADMIN')) {
      throw new Error('Forbidden');
    }

    return await this.soalRepository.deleteSoal(id);
  };
}

export default ExamService;
