import * as userRepository from '../repositories/userRepository.js';
import { generateDefaultPassword, hashPassword } from '../utils/authUtils.js';

export const createUser = async (userData, currentUser) => {
  const { username, name, role, jabatan, rombelId } = userData;

  // Permission Check: Guru can only create SISWA
  if (currentUser.role === 'GURU' && role !== 'SISWA') {
    throw new Error('Guru hanya diperbolehkan membuat user dengan role SISWA');
  }

  const existingUser = await userRepository.findByUsername(username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Generate random default password (Uppercase + Numbers)
  const defaultPassword = generateDefaultPassword(6);

  // ONLY hash if role is ADMIN
  const finalPassword = (role === 'ADMIN')
    ? await hashPassword(defaultPassword)
    : defaultPassword;

  const newUser = await userRepository.create({
    username,
    password: finalPassword,
    name,
    role,
    jabatan,
    rombelId
  });

  return {
    user: newUser,
    defaultPassword
  };
};

export const getAllUsers = async (query) => {
  const { role, rombelId, search } = query;
  const filters = {};
  if (role) filters.role = role;
  if (rombelId) filters.rombelId = rombelId;
  if (search) {
    filters.OR = [
      { name: { contains: search } },
      { username: { contains: search } }
    ];
  }

  return await userRepository.findAll(filters);
};

export const updateProfile = async (userId, updateData) => {
  const data = {};
  if (updateData.password) data.password = await hashPassword(updateData.password);
  if (updateData.name) data.name = updateData.name;

  if (Object.keys(data).length === 0) {
    throw new Error('No data provided to update');
  }

  return await userRepository.update(userId, data);
};

export const deleteUser = async (id, currentUser) => {
  const userToDelete = await userRepository.findById(id);
  if (!userToDelete) {
    throw new Error('User tidak ditemukan');
  }

  // Permission Check: Guru can only delete SISWA
  if (currentUser.role === 'GURU' && userToDelete.role !== 'SISWA') {
    throw new Error('Guru hanya bisa menghapus user dengan role SISWA');
  }

  return await userRepository.deleteUser(id);
};

export const changePassword = async (id, newPassword, currentUser) => {
  const userToUpdate = await userRepository.findById(id);
  if (!userToUpdate) {
    throw new Error('User tidak ditemukan');
  }

  // ONLY hash if role is ADMIN
  const finalPassword = (userToUpdate.role === 'ADMIN')
    ? await hashPassword(newPassword)
    : newPassword;

  return await userRepository.update(id, { password: finalPassword });
};
