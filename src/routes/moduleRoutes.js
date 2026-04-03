import express from 'express';
import { createModule, updateModule, getMyModules, deleteModule } from '../controllers/moduleController.js';
import { authenticate, isGuru } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(isGuru);

router.post('/', upload.single('pdf'), createModule);
router.put('/:id', upload.single('pdf'), updateModule);
router.delete('/:id', deleteModule);
router.get('/my', getMyModules);

export default router;
