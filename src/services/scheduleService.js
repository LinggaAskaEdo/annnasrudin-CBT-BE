import * as jadwalUjianRepository from '../repositories/jadwalUjianRepository.js';
import * as paketUjianRepository from '../repositories/paketUjianRepository.js';

export const createSchedule = async (scheduleData, currentUser) => {
  const { paketUjianId } = scheduleData;
  const paketUjian = await paketUjianRepository.findById(paketUjianId);
  if (!paketUjian || paketUjian.guruId !== currentUser.id) {
    throw new Error('Forbidden');
  }

  return await jadwalUjianRepository.create({
    ...scheduleData,
    startTime: new Date(scheduleData.startTime),
    endTime: new Date(scheduleData.endTime),
    deadline: new Date(scheduleData.deadline)
  });
};

export const getMySchedules = async (currentUser) => {
  return await jadwalUjianRepository.findAll({ paketUjian: { guruId: currentUser.id } });
};

export const updateSchedule = async (id, scheduleData, currentUser) => {
  const existing = await jadwalUjianRepository.findById(id);
  if (!existing || existing.paketUjian.guruId !== currentUser.id) {
    throw new Error('Forbidden');
  }

  const data = {
    ...scheduleData,
    startTime: scheduleData.startTime ? new Date(scheduleData.startTime) : undefined,
    endTime: scheduleData.endTime ? new Date(scheduleData.endTime) : undefined,
    deadline: scheduleData.deadline ? new Date(scheduleData.deadline) : undefined
  };

  return await jadwalUjianRepository.update(id, data);
};

export const deleteSchedule = async (id, currentUser) => {
  const existing = await jadwalUjianRepository.findById(id);
  if (!existing || existing.paketUjian.guruId !== currentUser.id) {
    throw new Error('Forbidden');
  }

  return await jadwalUjianRepository.deleteJadwal(id);
};
