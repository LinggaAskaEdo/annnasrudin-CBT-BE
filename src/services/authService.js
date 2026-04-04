import { PrismaClient } from '@prisma/client';
import { comparePassword, generateToken } from '../utils/authUtils.js';

const prisma = new PrismaClient();

/**
 * Handles user authentication
 * @param {string} username
 * @param {string} password
 * @param {string} sessionId
 * @returns {Promise<{user: object, token: string}>}
 */
export const loginUser = async (username, password, sessionId) => {
  const user = await prisma.user.findUnique({
    where: { username }
  });

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
  await prisma.user.update({
    where: { id: user.id },
    data: { currentSessionId: sessionId }
  });

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
