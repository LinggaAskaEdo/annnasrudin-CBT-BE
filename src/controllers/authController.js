import Joi from 'joi';
import winston from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * Login handler
   */
  login = async (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    const { username, password } = req.body;

    try {
      const sessionId = uuidv4();
      const { user, token } = await this.authService.loginUser(username, password, sessionId);

      winston.info(`User ${username} logged in successfully. Session: ${sessionId}`);

      res.json({
        status: 'success',
        data: {
          user,
          token,
          sessionId
        }
      });
    } catch (error) {
      if (error.message) {
        return res.status(401).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  };

  /**
   * Logout handler
   */
  logout = async (req, res, next) => {
    try {
      await this.authService.logoutUser(req.user.id);

      winston.info(`User ${req.user.username} logged out successfully.`);

      res.json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
