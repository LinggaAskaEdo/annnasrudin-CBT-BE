import express from 'express';
import { updateProfile, getSiswa, getExamResults, getSubmissionDetail, gradeUraian } from '../controllers/guruController.js';
import { createUser, deleteUser, createRombel, getAllRombels } from '../controllers/adminController.js';
import { authenticate, isGuru } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(isGuru);

router.patch('/profile', updateProfile);
router.get('/siswa', getSiswa);
router.get('/exam-results', getExamResults);

// Siswa Management by Guru
router.post('/siswa', createUser);
router.delete('/siswa/:id', deleteUser);

// Rombel Management
router.post('/rombel', createRombel);
router.get('/rombel', getAllRombels);

// Manual Grading
router.get('/submissions/:hasilUjianId', getSubmissionDetail);
router.patch('/submissions/:hasilUjianId/grade', gradeUraian);

export default router;
