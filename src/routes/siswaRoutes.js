import express from 'express';
import { updateProfile, getAvailableModules, getAvailableExams, getResults, getResultDetail } from '../controllers/siswaController.js';
import { startExam, submitExam } from '../controllers/examSessionController.js';
import { authenticate, isSiswa } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(isSiswa);

// Profile
router.patch('/profile', updateProfile);

// Learning Materials
router.get('/modules', getAvailableModules);

// Exam Sessions (CBT)
router.get('/exams', getAvailableExams);
router.post('/exams/:scheduleId/start', startExam);
router.post('/exams/:scheduleId/submit', submitExam);

// Results History
router.get('/results', getResults);
router.get('/results/:hasilUjianId', getResultDetail);

export default router;
