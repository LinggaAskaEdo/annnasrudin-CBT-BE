import { generateDefaultPassword, hashPassword } from '../utils/authUtils.js';

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  createUser = async (userData, currentUser) => {
    const { username, name, role, jabatan, rombelId } = userData;

    // Permission Check: Guru can only create SISWA
    if (currentUser.role === 'GURU' && role !== 'SISWA') {
      throw new Error('Guru hanya diperbolehkan membuat user dengan role SISWA');
    }

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Generate random default password (Uppercase + Numbers)
    const defaultPassword = generateDefaultPassword(6);

    // ONLY hash if role is ADMIN
    const finalPassword = (role === 'ADMIN')
      ? await hashPassword(defaultPassword)
      : defaultPassword;

    const newUser = await this.userRepository.create({
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

  getAllUsers = async (query) => {
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

    return await this.userRepository.findAll(filters);
  };

  updateProfile = async (userId, updateData) => {
    const data = {};
    if (updateData.password) data.password = await hashPassword(updateData.password);
    if (updateData.name) data.name = updateData.name;

    if (Object.keys(data).length === 0) {
      throw new Error('No data provided to update');
    }

    return await this.userRepository.update(userId, data);
  };

  deleteUser = async (id, currentUser) => {
    const userToDelete = await this.userRepository.findById(id);
    if (!userToDelete) {
      throw new Error('User tidak ditemukan');
    }

    // Permission Check: Guru can only delete SISWA
    if (currentUser.role === 'GURU' && userToDelete.role !== 'SISWA') {
      throw new Error('Guru hanya bisa menghapus user dengan role SISWA');
    }

    return await this.userRepository.deleteUser(id);
  };

  changePassword = async (id, newPassword, currentUser) => {
    const userToUpdate = await this.userRepository.findById(id);
    if (!userToUpdate) {
      throw new Error('User tidak ditemukan');
    }

    // ONLY hash if role is ADMIN
    const finalPassword = (userToUpdate.role === 'ADMIN')
      ? await hashPassword(newPassword)
      : newPassword;

    return await this.userRepository.update(id, { password: finalPassword });
  };
}

export default UserService;
