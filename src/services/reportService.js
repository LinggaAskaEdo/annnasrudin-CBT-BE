class ReportService {
  constructor(hasilUjianRepository, jadwalUjianRepository) {
    this.hasilUjianRepository = hasilUjianRepository;
    this.jadwalUjianRepository = jadwalUjianRepository;
  }

  getAllReports = async (query) => {
    const { rombelId, jadwalUjianId, status } = query;
    const filters = {};
    if (rombelId) filters.siswa = { rombelId };
    if (jadwalUjianId) filters.jadwalUjianId = jadwalUjianId;
    if (status) filters.status = status;

    return await this.hasilUjianRepository.findByFilters(filters);
  };

  getReportById = async (id) => {
    return await this.hasilUjianRepository.findById(id);
  };

  updateReport = async (id, scoreUraian) => {
    return await this.hasilUjianRepository.update(id, { scoreUraian });
  };

  getClassroomReport = async (scheduleId) => {
    const schedule = await this.jadwalUjianRepository.findById(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    const processedResults = schedule.hasilUjians.map(h => {
      return {
        siswaName: h.siswa.name,
        username: h.siswa.username,
        scorePilgan: h.scorePilgan,
        scoreUraian: h.scoreUraian,
        totalScore: (h.scorePilgan || 0) + (h.scoreUraian || 0),
        status: h.status,
        submittedAt: h.updatedAt
      };
    });

    return {
      judulUjian: schedule.ujian.title,
      subject: schedule.ujian.mapel,
      rombel: schedule.rombel.name,
      results: processedResults
    };
  };
}

export default ReportService;
