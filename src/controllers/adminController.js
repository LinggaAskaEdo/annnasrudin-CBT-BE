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

/**
 * Creates a new user (Guru or Siswa) by the admin.
 * Generates a default password (e.g., H7HGX4).
 */
export const createUser = async (req, res, next) => {
  const { error } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }

  const { username, name, role, jabatan, rombelId } = req.body;

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
    const hashedPassword = await hashPassword(defaultPassword);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
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

    winston.info(`Admin ${req.user.username} created new ${role}: ${username}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
        defaultPassword // Admin can see the generated password to give it to the user
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
        name: true,
        role: true,
        jabatan: true,
        rombelId: true,
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
