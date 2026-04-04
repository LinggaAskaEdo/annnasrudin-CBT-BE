import * as userService from '../services/userService.js';
import * as rombelService from '../services/rombelService.js';
import Joi from 'joi';
import winston from '../utils/logger.js';

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

  try {
    const { user, defaultPassword } = await userService.createUser(req.body, req.user);

    winston.info(`${req.user.role} ${req.user.username} created new ${user.role}: ${user.username}`);

    res.status(201).json({
      status: 'success',
      data: {
        user,
        defaultPassword
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

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers(req.query);
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

  try {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);
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

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const userToDelete = await userService.deleteUser(id, req.user);
    winston.info(`${req.user.role} ${req.user.username} deleted user: ${id}`);
    res.json({
      status: 'success',
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    winston.error(`Delete user failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

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
    const userToUpdate = await userService.changePassword(id, newPassword, req.user);
    winston.info(`Admin ${req.user.username} changed password for user: ${id}`);
    res.json({
      status: 'success',
      message: 'Password user berhasil diubah'
    });
  } catch (error) {
    winston.error(`Admin change password failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

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
    const newRombel = await rombelService.createRombel(name);
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

export const getAllRombels = async (req, res, next) => {
  try {
    const rombels = await rombelService.getAllRombels();
    res.json({ status: 'success', data: rombels });
  } catch (error) {
    winston.error(`Fetching rombels failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
