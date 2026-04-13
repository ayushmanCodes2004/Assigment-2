const User = require('../models/User');

class UserService {
  async createUser(email, password) {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('USER_EXISTS');
    }
    return await User.create(email, password);
  }

  async findUserByEmail(email) {
    return await User.findByEmail(email);
  }

  async findUserById(id) {
    return await User.findById(id);
  }

  async validatePassword(plainPassword, hashedPassword) {
    return await User.comparePassword(plainPassword, hashedPassword);
  }
}

module.exports = new UserService();
