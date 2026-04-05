class ExamService {
  constructor(paketUjianRepository, soalRepository) {
    this.paketUjianRepository = paketUjianRepository;
    this.soalRepository = soalRepository;
  }

  createExamPackage = async (title, mapelId, guruId) => {
    return await this.paketUjianRepository.create({
      title,
      mapelId,
      guruId
    });
  };

  createQuestion = async (questionData, currentUser) => {
    const { paketUjianId } = questionData;
    const paketUjian = await this.paketUjianRepository.findById(paketUjianId);
    if (!paketUjian || paketUjian.guruId !== currentUser.id) {
      throw new Error('Forbidden');
    }

    return await this.soalRepository.create(questionData);
  };

  getBankSoal = async (query) => {
    const { mapelId, search } = query;
    const filters = {};
    if (mapelId) filters.paketUjian = { mapelId };
    if (search) filters.questionText = { contains: search };

    return await this.soalRepository.findAll(filters);
  };

  getMyPackages = async (guruId) => {
    return await this.paketUjianRepository.findAll({ guruId });
  };

  updateExamPackage = async (id, title, mapelId, currentUser) => {
    const existing = await this.paketUjianRepository.findById(id);
    if (!existing || existing.guruId !== currentUser.id) {
      throw new Error('Forbidden');
    }

    return await this.paketUjianRepository.update(id, { title, mapelId });
  };

  deleteExamPackage = async (id, currentUser) => {
    const existing = await this.paketUjianRepository.findById(id);
    if (!existing || existing.guruId !== currentUser.id) {
      throw new Error('Forbidden');
    }

    return await this.paketUjianRepository.deletePackage(id);
  };

  updateQuestion = async (id, questionData, currentUser) => {
    const existing = await this.soalRepository.findById(id);
    if (!existing || existing.paketUjian.guruId !== currentUser.id) {
      throw new Error('Forbidden');
    }

    return await this.soalRepository.update(id, questionData);
  };

  deleteQuestion = async (id, currentUser) => {
    const existing = await this.soalRepository.findById(id);
    if (!existing || existing.paketUjian.guruId !== currentUser.id) {
      throw new Error('Forbidden');
    }

    return await this.soalRepository.deleteSoal(id);
  };
}

export default ExamService;
