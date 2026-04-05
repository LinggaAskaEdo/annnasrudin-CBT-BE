import express from 'express';
import { siswaController, examSessionController, authMiddleware } from '../container.js';

const router = express.Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.isSiswa);

// Profile
router.patch('/profile', siswaController.updateProfile);

// Learning Materials
router.get('/modules', siswaController.getAvailableModules);

// Exam Sessions (CBT)
router.get('/exams', siswaController.getAvailableExams);
router.post('/exams/:scheduleId/start', examSessionController.startExam);
router.post('/exams/:scheduleId/submit', examSessionController.submitExam);

// Results History
router.get('/results', siswaController.getResults);
router.get('/results/:hasilUjianId', siswaController.getResultDetail);

export default router;
