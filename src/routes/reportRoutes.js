import express from 'express';
import { getClassroomReport } from '../controllers/reportController.js';
import { authenticate, isGuru } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(isGuru);

// Guru/Admin can view classroom-wide report in JSON
router.get('/exams/:scheduleId', getClassroomReport);

export default router;
