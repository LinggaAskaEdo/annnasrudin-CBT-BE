import { comparePassword, generateToken } from '../utils/authUtils.js';

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Handles user authentication
   * @param {string} username
   * @param {string} password
   * @param {string} sessionId
   * @returns {Promise<{user: object, token: string}>}
   */
  loginUser = async (username, password, sessionId) => {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isPasswordValid = (user.role === 'ADMIN')
      ? await comparePassword(password, user.password)
      : (password === user.password); // Plain text comparison for Guru/Siswa

    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    // Update user with new sessionId
    await this.userRepository.update(user.id, { currentSessionId: sessionId });

    // Generate JWT access token with sessionId
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      sessionId // Critical for session validation
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      token
    };
  };

  /**
   * Handles user logout
   * @param {string} userId
   */
  logoutUser = async (userId) => {
    await this.userRepository.update(userId, { currentSessionId: null });
  };
}

export default AuthService;
