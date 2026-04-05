import * as hasilUjianRepository from '../repositories/hasilUjianRepository.js';
import * as jadwalUjianRepository from '../repositories/jadwalUjianRepository.js';

export const getAllReports = async (query) => {
  const { rombelId, jadwalUjianId, status } = query;
  const filters = {};
  if (rombelId) filters.siswa = { rombelId };
  if (jadwalUjianId) filters.jadwalUjianId = jadwalUjianId;
  if (status) filters.status = status;

  return await hasilUjianRepository.findByFilters(filters);
};

export const getReportById = async (id) => {
  return await hasilUjianRepository.findById(id);
};

export const updateReport = async (id, scoreUraian) => {
  return await hasilUjianRepository.update(id, { scoreUraian });
};

export const getClassroomReport = async (scheduleId) => {
  const schedule = await jadwalUjianRepository.findById(scheduleId);
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
    examTitle: schedule.paketUjian.title,
    subject: schedule.paketUjian.mapel.name,
    rombel: schedule.rombel.name,
    results: processedResults
  };
};
