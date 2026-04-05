class ScheduleService {
  constructor(jadwalUjianRepository, paketUjianRepository) {
    this.jadwalUjianRepository = jadwalUjianRepository;
    this.paketUjianRepository = paketUjianRepository;
  }

  createSchedule = async (scheduleData, currentUser) => {
    const { paketUjianId } = scheduleData;
    const paketUjian = await this.paketUjianRepository.findById(paketUjianId);
    if (!paketUjian || paketUjian.guruId !== currentUser.id) {
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
    return await this.jadwalUjianRepository.findAll({ paketUjian: { guruId: currentUser.id } });
  };

  updateSchedule = async (id, scheduleData, currentUser) => {
    const existing = await this.jadwalUjianRepository.findById(id);
    if (!existing || existing.paketUjian.guruId !== currentUser.id) {
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
    if (!existing || existing.paketUjian.guruId !== currentUser.id) {
      throw new Error('Forbidden');
    }

    return await this.jadwalUjianRepository.deleteJadwal(id);
  };
}

export default ScheduleService;
