import express from 'express';
import { examController, scheduleController, authMiddleware } from '../container.js';

const router = express.Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.isGuru);

// Ujian
router.post('/', examController.createUjian);
router.get('/', examController.getUjianSaya);
router.put('/:id', examController.updateUjian);
router.delete('/:id', examController.deleteUjian);

// Soal
router.post('/soal', examController.createSoal);
router.get('/soal/bank', examController.getBankSoal);
router.put('/soal/:id', examController.updateSoal);
router.delete('/soal/:id', examController.deleteSoal);

// Scheduling (Rename handlers if they were renamed in controller, but only exam/package/question was requested. Let's check scheduleController)
router.post('/schedule', scheduleController.scheduleExam);
router.get('/schedule', scheduleController.getMySchedules);
router.put('/schedule/:id', scheduleController.updateSchedule);
router.delete('/schedule/:id', scheduleController.deleteSchedule);

export default router;
