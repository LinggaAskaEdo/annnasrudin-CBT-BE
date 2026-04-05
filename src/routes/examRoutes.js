import express from 'express';
import { examController, scheduleController, authMiddleware } from '../container.js';

const router = express.Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.isGuru);

// Exam Packages
router.post('/packages', examController.createExamPackage);
router.get('/my-packages', examController.getMyPackages);
router.put('/packages/:id', examController.updateExamPackage);
router.delete('/packages/:id', examController.deleteExamPackage);

// Questions
router.post('/questions', examController.createQuestion);
router.get('/bank-soal', examController.getBankSoal);
router.put('/questions/:id', examController.updateQuestion);
router.delete('/questions/:id', examController.deleteQuestion);

// Scheduling
router.post('/schedule', scheduleController.scheduleExam);
router.get('/my-schedules', scheduleController.getMySchedules);
router.put('/schedule/:id', scheduleController.updateSchedule);
router.delete('/schedule/:id', scheduleController.deleteSchedule);

export default router;
