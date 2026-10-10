const express = require('express');
const {
  getCurrentUser,
  login,
  register
} = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const {
  loginValidation,
  registerValidation
} = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
