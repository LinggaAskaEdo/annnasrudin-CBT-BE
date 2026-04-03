import { verifyToken } from '../utils/authUtils.js';
import winston from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to verify a user's JWT token and session
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Express.NextFunction} next
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    
    // Session Validation: Check if the token's sessionId matches the current database record
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { currentSessionId: true }
    });

    if (!user || user.currentSessionId !== decoded.sessionId) {
        return res.status(401).json({
            status: 'error',
            message: 'Sedang login di perangkat lain'
        });
    }

    req.user = decoded;
    next();
  } catch (error) {
    winston.error(`Auth Error: ${error.message}`);
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid or expired token'
    });
  }
};

/**
 * Middleware to restrict access based on user role
 * @param {string[]} allowedRoles
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You do not have permission for this action'
      });
    }
    next();
  };
};

/**
 * Short-hand for Admin-only access
 */
export const isAdmin = authorize(['ADMIN']);

/**
 * Short-hand for Guru access
 */
export const isGuru = authorize(['GURU', 'ADMIN']);

/**
 * Short-hand for Siswa access
 */
export const isSiswa = authorize(['SISWA', 'ADMIN']);
