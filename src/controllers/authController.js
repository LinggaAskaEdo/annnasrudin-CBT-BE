import { loginUser, logoutUser } from '../services/authService.js';
import Joi from 'joi';
import winston from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

/**
 * Login handler
 */
export const login = async (req, res, next) => {
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
    const { user, token } = await loginUser(username, password, sessionId);

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
    winston.error(`Login failed: ${error.message}`);
    res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Logout handler
 */
export const logout = async (req, res, next) => {
  try {
    await logoutUser(req.user.id);

    winston.info(`User ${req.user.username} logged out successfully.`);

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    winston.error(`Logout failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
