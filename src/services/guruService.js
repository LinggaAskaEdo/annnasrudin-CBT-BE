import { hashPassword } from '../utils/authUtils.js';

class GuruService {
  constructor(userRepository, hasilUjianRepository) {
    this.userRepository = userRepository;
    this.hasilUjianRepository = hasilUjianRepository;
  }

  updateProfile = async (userId, updateData) => {
    const { password, name, jabatan, mapelIds } = updateData;
    const data = {};
    if (password) data.password = await hashPassword(password);
    if (name) data.name = name;
    if (jabatan) data.jabatan = jabatan;
    
    if (mapelIds) {
      data.instructedMapels = {
        set: mapelIds.map(id => ({ id }))
      };
    }

    return await this.userRepository.update(userId, data);
  };

  getSiswa = async (query) => {
    const { rombelId, search } = query;
    const filters = { role: 'SISWA' };
    if (rombelId) filters.rombelId = rombelId;
    if (search) {
      filters.OR = [
        { name: { contains: search } },
        { username: { contains: search } }
      ];
    }

    return await this.userRepository.findAll(filters);
  };

  getSubmissionDetail = async (hasilUjianId) => {
    const submission = await this.hasilUjianRepository.findById(hasilUjianId);
    if (!submission) throw new Error('Submission not found');
    return submission;
  };

  gradeUraian = async (hasilUjianId, uraianGrades, currentUser) => {
    const submission = await this.hasilUjianRepository.findById(hasilUjianId);
    if (!submission) throw new Error('Submission not found');

    const updatedAnswers = Array.from(submission.answers).map(ans => {
      const grade = uraianGrades.find(g => g.soalId === ans.soalId);
      if (grade && ans.type === 'URAIAN') {
        return {
          ...ans,
          guruScore: grade.guruScore,
          feedback: grade.feedback
        };
      }
      return ans;
    });

    let totalUraianScore = 0;
    updatedAnswers.forEach(ans => {
      if (ans.type === 'URAIAN') totalUraianScore += (ans.guruScore || 0);
    });

    return await this.hasilUjianRepository.update(hasilUjianId, {
      answers: updatedAnswers,
      scoreUraian: totalUraianScore
    });
  };

  getExamResults = async (query) => {
    const { rombelId, jadwalUjianId } = query;
    const filters = {};
    if (rombelId) filters.siswa = { rombelId };
    if (jadwalUjianId) filters.jadwalUjianId = jadwalUjianId;

    return await this.hasilUjianRepository.findByFilters(filters);
  };
}

export default GuruService;
