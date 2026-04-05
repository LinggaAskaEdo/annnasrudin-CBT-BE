import { verifyToken } from '../utils/authUtils.js';
import winston from '../utils/logger.js';

class AuthMiddleware {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Middleware to verify a user's JWT token and session
   */
  authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);
      
      // Session Validation: Check if the token's sessionId matches the current database record
      const user = await this.userRepository.findById(decoded.id);

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
   */
  authorize = (allowedRoles) => {
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
   * Short-hands for role-based access
   */
  isAdmin = (req, res, next) => this.authorize(['ADMIN'])(req, res, next);
  isGuru = (req, res, next) => this.authorize(['GURU', 'ADMIN'])(req, res, next);
  isSiswa = (req, res, next) => this.authorize(['SISWA', 'ADMIN'])(req, res, next);
}

export default AuthMiddleware;
