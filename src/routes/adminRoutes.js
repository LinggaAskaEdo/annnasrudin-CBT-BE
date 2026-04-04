import express from 'express';
import { createUser, getAllUsers, updateAdminProfile, deleteUser, changeUserPassword, createRombel, getAllRombels } from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes here are protected by JWT and Admin check
router.use(authenticate);
router.use(isAdmin);

// Admin profile management
router.patch('/profile', updateAdminProfile);

// Admin-only: User control
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/password', changeUserPassword);

// Rombel management
router.post('/rombel', createRombel);
router.get('/rombel', getAllRombels);

export default router;
