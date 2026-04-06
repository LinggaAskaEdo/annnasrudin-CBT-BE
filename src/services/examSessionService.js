class ExamSessionService {
  constructor(hasilUjianRepository, jadwalUjianRepository) {
    this.hasilUjianRepository = hasilUjianRepository;
    this.jadwalUjianRepository = jadwalUjianRepository;
  }

  startExam = async (scheduleId, siswaId) => {
    const schedule = await this.jadwalUjianRepository.findById(scheduleId);
    if (!schedule) throw new Error('Ujian tidak ditemukan');

    const existingSessions = await this.hasilUjianRepository.findByFilters({
      siswaId,
      jadwalUjianId: scheduleId
    });

    const session = existingSessions.length > 0 ? existingSessions[0] : null;

    if (session?.status === 'COMPLETED') {
      throw new Error('Ujian sudah dikumpulkan');
    }

    const now = new Date();

    // Lazy Force-Submit: If deadline passed but session is still ONGOING
    if (session?.status === 'ONGOING' && now > schedule.deadline) {
      await this.hasilUjianRepository.update(session.id, { status: 'COMPLETED' });
      throw new Error('Waktu ujian telah berakhir');
    }

    if (now < schedule.startTime || now > schedule.deadline) {
      throw new Error('Ujian belum atau sudah tidak tersedia');
    }

    let result;
    if (session) {
      result = session;
    } else {
      result = await this.hasilUjianRepository.create({
        siswaId,
        jadwalUjianId: scheduleId,
        status: 'ONGOING',
        startTime: now,
        answers: []
      });
    }

    // Strip correct answers before sending to siswa
    const questionsForSiswa = schedule.ujian.soals.map(s => {
      const { correctAnswer, ...safeQuestion } = s;
      return safeQuestion;
    });

    return {
      session: result,
      soal: questionsForSiswa
    };
  };

  submitExam = async (scheduleId, answers, siswaId) => {
    const sessions = await this.hasilUjianRepository.findByFilters({
      jadwalUjianId: scheduleId,
      siswaId,
      status: 'ONGOING'
    });

    const session = sessions.length > 0 ? sessions[0] : null;
    if (!session) throw new Error('Sesi ujian aktif tidak ditemukan');

    const schedule = await this.jadwalUjianRepository.findById(scheduleId);

    // Auto-Grading Logic
    let score = 0;
    const questions = schedule.ujian.soals;
    const gradedAnswers = answers.map(ans => {
      const question = questions.find(q => q.id === ans.soalId);
      if (!question) return ans;

      if (question.questionType === 'PILGAN' && question.correctAnswer === ans.answer) {
        score += 1;
      }
      return { ...ans, type: question.questionType };
    });

    const finalScore = score;
    const now = new Date();

    const updateData = {
      scorePilgan: finalScore,
      answers: gradedAnswers,
      status: 'COMPLETED'
    };

    await this.hasilUjianRepository.update(session.id, updateData);

    if (now > schedule.deadline) {
      throw new Error('Jawaban dikumpulkan setelah batas waktu. Skor disimpan namun ditandai.');
    }

    return {
      scorePilgan: finalScore
    };
  };
}

export default ExamSessionService;
