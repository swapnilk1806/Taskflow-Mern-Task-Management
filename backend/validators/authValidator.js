const { body } = require('express-validator');
const { validateObjectBody, validateRequest } = require('./validateRequest');

const registerValidation = [
  validateObjectBody,
  body('name')
    .isString()
    .withMessage('Name must be a string.')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password must be a string.')
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters.')
    .bail()
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('Password must be no more than 72 UTF-8 bytes.'),
  validateRequest
];

const loginValidation = [
  validateObjectBody,
  body('email')
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password is required.')
    .bail()
    .notEmpty()
    .withMessage('Password is required.')
    .bail()
    .isLength({ max: 128 })
    .withMessage('Password must be 128 characters or fewer.')
    .bail()
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('Password must be no more than 72 UTF-8 bytes.'),
  validateRequest
];

module.exports = {
  registerValidation,
  loginValidation
};
