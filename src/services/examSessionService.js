class ExamSessionService {
  constructor(hasilUjianRepository, jadwalUjianRepository) {
    this.hasilUjianRepository = hasilUjianRepository;
    this.jadwalUjianRepository = jadwalUjianRepository;
  }

  startExam = async (scheduleId, siswaId) => {
    const schedule = await this.jadwalUjianRepository.findById(scheduleId);
    if (!schedule) throw new Error('Exam not found');

    const existingSessions = await this.hasilUjianRepository.findByFilters({
      siswaId,
      jadwalUjianId: scheduleId
    });

    const session = existingSessions.length > 0 ? existingSessions[0] : null;

    if (session?.status === 'COMPLETED') {
      throw new Error('Exam already submitted');
    }

    const now = new Date();

    // Lazy Force-Submit: If deadline passed but session is still ONGOING
    if (session?.status === 'ONGOING' && now > schedule.deadline) {
      await this.hasilUjianRepository.update(session.id, { status: 'COMPLETED' });
      throw new Error('Exam period has ended');
    }

    if (now < schedule.startTime || now > schedule.deadline) {
      throw new Error('Exam not available at this time');
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
    const questionsForSiswa = schedule.paketUjian.soals.map(s => {
      const { correctAnswer, ...safeQuestion } = s;
      return safeQuestion;
    });

    return {
      session: result,
      questions: questionsForSiswa
    };
  };

  submitExam = async (scheduleId, answers, siswaId) => {
    const sessions = await this.hasilUjianRepository.findByFilters({
      jadwalUjianId: scheduleId,
      siswaId,
      status: 'ONGOING'
    });

    const session = sessions.length > 0 ? sessions[0] : null;
    if (!session) throw new Error('No active session found');

    const schedule = await this.jadwalUjianRepository.findById(scheduleId);

    // Auto-Grading Logic
    let score = 0;
    const questions = schedule.paketUjian.soals;
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
      throw new Error('Submitted after deadline. Score saved but marked.');
    }

    return {
      scorePilgan: finalScore
    };
  };
}

export default ExamSessionService;
