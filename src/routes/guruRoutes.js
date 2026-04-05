import express from 'express';
import { guruController, adminController, authMiddleware } from '../container.js';

const router = express.Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.isGuru);

router.patch('/profile', guruController.updateProfile);
router.get('/siswa', guruController.getSiswa);
router.get('/exam-results', guruController.getExamResults);

// Siswa Management by Guru
router.post('/siswa', adminController.createUser);
router.delete('/siswa/:id', adminController.deleteUser);

// Rombel Management
router.post('/rombel', adminController.createRombel);
router.get('/rombel', adminController.getAllRombels);

// Manual Grading
router.get('/submissions/:hasilUjianId', guruController.getSubmissionDetail);
router.patch('/submissions/:hasilUjianId/grade', guruController.gradeUraian);

export default router;
