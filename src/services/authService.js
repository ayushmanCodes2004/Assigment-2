const userService = require('./userService');
const { generateToken } = require('../utils/jwtUtils');

class AuthService {
  async register(email, password) {
    const user = await userService.createUser(email, password);
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      },
      token
    };
  }

  async login(email, password) {
    const user = await userService.findUserByEmail(email);
    
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await userService.validatePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email
      },
      token
    };
  }

  async getUserProfile(userId) {
    const user = await userService.findUserById(userId);
    
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.created_at
    };
  }
}

module.exports = new AuthService();
