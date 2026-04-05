import express from 'express';
import { moduleController, authMiddleware } from '../container.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.isGuru);

router.post('/', upload.single('pdf'), moduleController.createModule);
router.put('/:id', upload.single('pdf'), moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);
router.get('/my', moduleController.getMyModules);

export default router;
