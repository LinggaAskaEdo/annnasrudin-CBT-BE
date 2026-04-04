import { PrismaClient } from '@prisma/client';
import { generateDefaultPassword, hashPassword } from '../utils/authUtils.js';
import Joi from 'joi';
import winston from '../utils/logger.js';

const prisma = new PrismaClient();

const createUserSchema = Joi.object({
  username: Joi.string().required(),
  name: Joi.string().required(),
  role: Joi.string().valid('ADMIN', 'GURU', 'SISWA').required(),
  jabatan: Joi.string().allow('', null).optional(),
  rombelId: Joi.string().uuid().allow(null).optional()
});

export const createUser = async (req, res, next) => {
  const { error } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }

  const { username, name, role, jabatan, rombelId } = req.body;

  // Permission Check: Guru can only create SISWA
  if (req.user.role === 'GURU' && role !== 'SISWA') {
    return res.status(403).json({
      status: 'error',
      message: 'Guru hanya diperbolehkan membuat user dengan role SISWA'
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Generate random default password (Uppercase + Numbers)
    const defaultPassword = generateDefaultPassword(6);

    // ONLY hash if role is ADMIN
    const finalPassword = (role === 'ADMIN')
      ? await hashPassword(defaultPassword)
      : defaultPassword;

    const newUser = await prisma.user.create({
      data: {
        username,
        password: finalPassword,
        name,
        role,
        jabatan,
        rombelId
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    winston.info(`${req.user.role} ${req.user.username} created new ${role}: ${username}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
        defaultPassword // User creation by Admin/Guru allows seeing generated password
      }
    });
  } catch (error) {
    winston.error(`User creation failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Lists all users with filtering support (e.g., for Siswa list in Admin dashboard)
 */
export const getAllUsers = async (req, res, next) => {
  const { role, rombelId, search } = req.query;

  try {
    const filters = {};
    if (role) filters.role = role;
    if (rombelId) filters.rombelId = rombelId;
    if (search) {
      filters.OR = [
        { name: { contains: search } },
        { username: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        username: true,
        password: true, // Only accessible by ADMIN due to route protection
        name: true,
        role: true,
        jabatan: true,
        rombelId: true,
        rombel: {
          select: {
            name: true
          }
        },
        createdAt: true
      }
    });

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    winston.error(`Fetching users failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Admin updates their own profile.
 */
export const updateAdminProfile = async (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string().min(6).optional(),
    name: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }

  const { password, name } = req.body;
  const userId = req.user.id;

  try {
    const updateData = {};
    if (password) updateData.password = await hashPassword(password);
    if (name) updateData.name = name;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ status: 'error', message: 'No data provided to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    winston.info(`Admin ${updatedUser.username} updated their profile`);

    res.json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    winston.error(`Admin profile update failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Deletes a user by Admin or Guru (Guru can only delete Siswa)
 */
export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ status: 'error', message: 'User tidak ditemukan' });
    }

    // Permission Check: Guru can only delete SISWA
    if (req.user.role === 'GURU' && userToDelete.role !== 'SISWA') {
      return res.status(403).json({
        status: 'error',
        message: 'Guru hanya bisa menghapus user dengan role SISWA'
      });
    }

    await prisma.user.delete({ where: { id } });

    winston.info(`${req.user.role} ${req.user.username} deleted user: ${userToDelete.username}`);

    res.json({
      status: 'success',
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    winston.error(`Delete user failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Admin change password of any user
 */
export const changeUserPassword = async (req, res, next) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'Password baru tidak boleh kosong'
    });
  }

  try {
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return res.status(404).json({ status: 'error', message: 'User tidak ditemukan' });
    }

    // ONLY hash if role is ADMIN
    const finalPassword = (userToUpdate.role === 'ADMIN')
      ? await hashPassword(newPassword)
      : newPassword;

    await prisma.user.update({
      where: { id },
      data: { password: finalPassword }
    });

    winston.info(`Admin ${req.user.username} changed password for user: ${userToUpdate.username}`);

    res.json({
      status: 'success',
      message: 'Password user berhasil diubah'
    });
  } catch (error) {
    winston.error(`Admin change password failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Create a new Rombel (Class)
 */
export const createRombel = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'error', message: error.details[0].message });
  }

  const { name } = req.body;

  try {
    const existing = await prisma.rombel.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Nama rombel sudah ada' });
    }

    const newRombel = await prisma.rombel.create({
      data: { name }
    });

    winston.info(`${req.user.role} ${req.user.username} created rombel: ${name}`);

    res.status(201).json({
      status: 'success',
      data: newRombel
    });
  } catch (error) {
    winston.error(`Create rombel failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * List all Rombels
 */
export const getAllRombels = async (req, res, next) => {
  try {
    const rombels = await prisma.rombel.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ status: 'success', data: rombels });
  } catch (error) {
    winston.error(`Fetching rombels failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
