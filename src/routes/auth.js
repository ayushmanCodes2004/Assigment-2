const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const auth = require('../middleware/auth');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/profile', auth, getProfile);

module.exports = router;