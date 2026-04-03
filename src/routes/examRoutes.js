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

// Questions
router.post('/questions', createQuestion);
router.get('/bank-soal', getBankSoal);

// Scheduling
router.post('/schedule', scheduleExam);
router.get('/my-schedules', getMySchedules);

export default router;
