import express from 'express';
import { adminController, authMiddleware } from '../container.js';

const router = express.Router();

// All routes here are protected by JWT and Admin check
router.use(authMiddleware.authenticate);
router.use(authMiddleware.isAdmin);

// Admin profile management
router.patch('/profile', adminController.updateAdminProfile);

// Admin-only: User control
router.post('/users', adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/password', adminController.changeUserPassword);

// Rombel management
router.post('/rombel', adminController.createRombel);
router.get('/rombel', adminController.getAllRombels);

export default router;
