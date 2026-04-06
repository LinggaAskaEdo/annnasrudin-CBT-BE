class ScheduleService {
  constructor(jadwalUjianRepository, ujianRepository) {
    this.jadwalUjianRepository = jadwalUjianRepository;
    this.ujianRepository = ujianRepository;
  }

  createSchedule = async (scheduleData, currentUser) => {
    const { ujianId } = scheduleData;
    const ujian = await this.ujianRepository.findById(ujianId);
    if (!ujian || (ujian.createdById !== currentUser.id && currentUser.role !== 'ADMIN')) {
      throw new Error('Forbidden');
    }

    return await this.jadwalUjianRepository.create({
      ...scheduleData,
      startTime: new Date(scheduleData.startTime),
      endTime: new Date(scheduleData.endTime),
      deadline: new Date(scheduleData.deadline)
    });
  };

  getMySchedules = async (currentUser) => {
    return await this.jadwalUjianRepository.findAll({ ujian: { createdById: currentUser.id } });
  };

  updateSchedule = async (id, scheduleData, currentUser) => {
    const existing = await this.jadwalUjianRepository.findById(id);
    if (!existing || (existing.ujian.createdById !== currentUser.id && currentUser.role !== 'ADMIN')) {
      throw new Error('Forbidden');
    }

    const data = {
      ...scheduleData,
      startTime: scheduleData.startTime ? new Date(scheduleData.startTime) : undefined,
      endTime: scheduleData.endTime ? new Date(scheduleData.endTime) : undefined,
      deadline: scheduleData.deadline ? new Date(scheduleData.deadline) : undefined
    };

    return await this.jadwalUjianRepository.update(id, data);
  };

  deleteSchedule = async (id, currentUser) => {
    const existing = await this.jadwalUjianRepository.findById(id);
    if (!existing || (existing.ujian.createdById !== currentUser.id && currentUser.role !== 'ADMIN')) {
      throw new Error('Forbidden');
    }

    return await this.jadwalUjianRepository.deleteJadwal(id);
  };
}

export default ScheduleService;
