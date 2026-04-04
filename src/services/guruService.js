import * as userRepository from '../repositories/userRepository.js';
import * as hasilUjianRepository from '../repositories/hasilUjianRepository.js';
import { hashPassword } from '../utils/authUtils.js';

export const updateProfile = async (userId, updateData) => {
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

  return await userRepository.update(userId, data);
};

export const getSiswa = async (query) => {
  const { rombelId, search } = query;
  const filters = { role: 'SISWA' };
  if (rombelId) filters.rombelId = rombelId;
  if (search) {
    filters.OR = [
      { name: { contains: search } },
      { username: { contains: search } }
    ];
  }

  return await userRepository.findAll(filters);
};

export const getSubmissionDetail = async (hasilUjianId) => {
  const submission = await hasilUjianRepository.findById(hasilUjianId);
  if (!submission) throw new Error('Submission not found');
  return submission;
};

export const gradeUraian = async (hasilUjianId, uraianGrades, currentUser) => {
  const submission = await hasilUjianRepository.findById(hasilUjianId);
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

  return await hasilUjianRepository.update(hasilUjianId, {
    answers: updatedAnswers,
    scoreUraian: totalUraianScore
  });
};

export const getExamResults = async (query) => {
  const { rombelId, jadwalUjianId } = query;
  const filters = {};
  if (rombelId) filters.siswa = { rombelId };
  if (jadwalUjianId) filters.jadwalUjianId = jadwalUjianId;

  return await hasilUjianRepository.findByFilters(filters);
};
