import express from 'express';
import { createExamPackage, createQuestion, getBankSoal, getMyPackages } from '../controllers/examController.js';
import { scheduleExam, getMySchedules } from '../controllers/scheduleController.js';
import { authenticate, isGuru } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(isGuru);

// Exam Packages
router.post('/packages', createExamPackage);
router.get('/my-packages', getMyPackages);
router.put('/packages/:id', updateExamPackage);
router.delete('/packages/:id', deleteExamPackage);

// Questions
router.post('/questions', createQuestion);
router.get('/bank-soal', getBankSoal);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Scheduling
router.post('/schedule', scheduleExam);
router.get('/my-schedules', getMySchedules);
router.put('/schedule/:id', updateSchedule);
router.delete('/schedule/:id', deleteSchedule);

export default router;
