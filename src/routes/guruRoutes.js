import express from 'express';
import { updateProfile, getSiswa, getExamResults, getSubmissionDetail, gradeUraian } from '../controllers/guruController.js';
import { authenticate, isGuru } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(isGuru);

router.patch('/profile', updateProfile);
router.get('/siswa', getSiswa);
router.get('/exam-results', getExamResults);

// Manual Grading
router.get('/submissions/:hasilUjianId', getSubmissionDetail);
router.patch('/submissions/:hasilUjianId/grade', gradeUraian);

export default router;
