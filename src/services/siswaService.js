import * as userRepository from '../repositories/userRepository.js';
import * as modulRepository from '../repositories/modulRepository.js';
import * as jadwalUjianRepository from '../repositories/jadwalUjianRepository.js';
import * as hasilUjianRepository from '../repositories/hasilUjianRepository.js';
import { hashPassword } from '../utils/authUtils.js';

export const updateProfile = async (userId, password) => {
  const hashedPassword = await hashPassword(password);
  return await userRepository.update(userId, { password: hashedPassword });
};

export const getAvailableModules = async (userId) => {
  const siswa = await userRepository.findById(userId);
  if (!siswa || !siswa.rombelId) return [];

  return await modulRepository.findAll({ rombelId: siswa.rombelId });
};

export const getAvailableExams = async (userId) => {
  const siswa = await userRepository.findById(userId);
  if (!siswa || !siswa.rombelId) return [];

  const now = new Date();
  const schedules = await jadwalUjianRepository.findAll({ rombelId: siswa.rombelId });

  // Map and filter/status check
  const exams = schedules.map(s => {
    // Check if user already has a result for this schedule
    const userResult = s.hasilUjians.find(h => h.siswaId === userId);
    
    let status = 'UPCOMING';
    if (userResult && userResult.status === 'COMPLETED') {
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

export const getResults = async (userId) => {
  return await hasilUjianRepository.findByFilters({ siswaId: userId });
};

export const getResultDetail = async (hasilUjianId, userId) => {
  const result = await hasilUjianRepository.findById(hasilUjianId);
  if (!result || result.siswaId !== userId) {
    throw new Error('Result not found');
  }
  return result;
};
