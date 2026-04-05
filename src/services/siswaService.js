import { hashPassword } from '../utils/authUtils.js';

class SiswaService {
  constructor(userRepository, modulRepository, jadwalUjianRepository, hasilUjianRepository) {
    this.userRepository = userRepository;
    this.modulRepository = modulRepository;
    this.jadwalUjianRepository = jadwalUjianRepository;
    this.hasilUjianRepository = hasilUjianRepository;
  }

  updateProfile = async (userId, password) => {
    const hashedPassword = await hashPassword(password);
    return await this.userRepository.update(userId, { password: hashedPassword });
  };

  getAvailableModules = async (userId) => {
    const siswa = await this.userRepository.findById(userId);
    if (!siswa?.rombelId) return [];

    return await this.modulRepository.findAll({ rombelId: siswa.rombelId });
  };

  getAvailableExams = async (userId) => {
    const siswa = await this.userRepository.findById(userId);
    if (!siswa?.rombelId) return [];

    const now = new Date();
    const schedules = await this.jadwalUjianRepository.findAll({ rombelId: siswa.rombelId });

    // Map and filter/status check
    const exams = schedules.map(s => {
      // Check if user already has a result for this schedule
      const userResult = s.hasilUjians?.find(h => h.siswaId === userId);
      
      let status = 'UPCOMING';
      if (userResult?.status === 'COMPLETED') {
        status = 'COMPLETED';
      } else if (now > s.deadline) {
        status = 'EXPIRED';
      } else if (now >= s.startTime && now <= s.deadline) {
        status = 'AVAILABLE';
      }

      return {
        id: s.id,
        title: s.paketUjian.title,
        subject: s.paketUjian.mapel.name,
        startTime: s.startTime,
        endTime: s.endTime,
        deadline: s.deadline,
        status
      };
    });

    return exams;
  };

  getResults = async (userId) => {
    return await this.hasilUjianRepository.findByFilters({ siswaId: userId });
  };

  getResultDetail = async (hasilUjianId, userId) => {
    const result = await this.hasilUjianRepository.findById(hasilUjianId);
    if (!result || result.siswaId !== userId) {
      throw new Error('Result not found');
    }
    return result;
  };
}

export default SiswaService;
