const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);

    res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    if (error.message === 'USER_EXISTS') {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};