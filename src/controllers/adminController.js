import Joi from 'joi';
import winston from '../utils/logger.js';

const createUserSchema = Joi.object({
  username: Joi.string().required(),
  name: Joi.string().required(),
  role: Joi.string().valid('ADMIN', 'GURU', 'SISWA').required(),
  jabatan: Joi.string().allow('', null).optional(),
  rombelId: Joi.string().uuid().allow(null).optional()
});

class AdminController {
  constructor(userService, rombelService) {
    this.userService = userService;
    this.rombelService = rombelService;
  }

  createUser = async (req, res, next) => {
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    try {
      const { user, defaultPassword } = await this.userService.createUser(req.body, req.user);

      winston.info(`${req.user.role} ${req.user.username} created new ${user.role}: ${user.username}`);

      res.status(201).json({
        status: 'success',
        data: {
          user,
          defaultPassword
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req, res, next) => {
    try {
      const users = await this.userService.getAllUsers(req.query);
      res.json({
        status: 'success',
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  updateAdminProfile = async (req, res, next) => {
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
      const updatedUser = await this.userService.updateProfile(req.user.id, req.body);
      winston.info(`Admin ${updatedUser.username} updated their profile`);
      res.json({
        status: 'success',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req, res, next) => {
    const { id } = req.params;

    try {
      await this.userService.deleteUser(id, req.user);
      winston.info(`${req.user.role} ${req.user.username} deleted user: ${id}`);
      res.json({
        status: 'success',
        message: 'User berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  };

  changeUserPassword = async (req, res, next) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Password baru tidak boleh kosong'
      });
    }

    try {
      await this.userService.changePassword(id, newPassword, req.user);
      winston.info(`Admin ${req.user.username} changed password for user: ${id}`);
      res.json({
        status: 'success',
        message: 'Password user berhasil diubah'
      });
    } catch (error) {
      next(error);
    }
  };

  createRombel = async (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    try {
      const { name } = req.body;
      const newRombel = await this.rombelService.createRombel(name);
      winston.info(`${req.user.role} ${req.user.username} created rombel: ${name}`);
      res.status(201).json({
        status: 'success',
        data: newRombel
      });
    } catch (error) {
      next(error);
    }
  };

  getAllRombels = async (req, res, next) => {
    try {
      const rombels = await this.rombelService.getAllRombels();
      res.json({ status: 'success', data: rombels });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;
