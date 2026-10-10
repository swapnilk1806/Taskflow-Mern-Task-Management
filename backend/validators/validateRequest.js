const { validationResult } = require('express-validator');

function validateObjectBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a JSON object.'
    });
  }

  next();
}

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Request validation failed.',
      errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }

  next();
}

module.exports = {
  validateObjectBody,
  validateRequest
};
