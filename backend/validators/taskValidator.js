const { body, param, query } = require('express-validator');
const { validateObjectBody, validateRequest } = require('./validateRequest');

const taskFields = [
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string.')
    .trim()
    .isLength({ min: 1, max: 160 })
    .withMessage('Title must be between 1 and 160 characters.'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string.')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or fewer.'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed.'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high.'),
  body('dueDate')
    .optional({ values: 'null' })
    .isISO8601({ strict: true })
    .withMessage('Due date must be a valid ISO 8601 date.')
    .toDate()
];

const createTaskValidation = [
  validateObjectBody,
  body('title')
    .isString()
    .withMessage('Title must be a string.')
    .trim()
    .isLength({ min: 1, max: 160 })
    .withMessage('Title must be between 1 and 160 characters.'),
  ...taskFields.filter((validator) => validator !== taskFields[0]),
  validateRequest
];

const updateTaskValidation = [
  validateObjectBody,
  param('id').isMongoId().withMessage('Task ID must be a valid MongoDB ObjectId.'),
  ...taskFields,
  body().custom((value) => {
    const editableFields = ['title', 'description', 'status', 'priority', 'dueDate'];
    if (!editableFields.some((field) => Object.prototype.hasOwnProperty.call(value, field))) {
      throw new Error('At least one editable task field is required.');
    }
    return true;
  }),
  validateRequest
];

const taskIdValidation = [
  param('id').isMongoId().withMessage('Task ID must be a valid MongoDB ObjectId.'),
  validateRequest
];

const statusValidation = [
  validateObjectBody,
  param('id').isMongoId().withMessage('Task ID must be a valid MongoDB ObjectId.'),
  body('status')
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed.'),
  validateRequest
];

const listTasksValidation = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be text.')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search must be 200 characters or fewer.'),
  query('status')
    .optional({ values: 'falsy' })
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed.'),
  query('priority')
    .optional({ values: 'falsy' })
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high.'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'dueDate', 'title', 'priority'])
    .withMessage('sortBy must be createdAt, dueDate, title, or priority.'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc.'),
  query('page')
    .optional()
    .isInt({ min: 1, max: 2147483647 })
    .withMessage('Page must be an integer between 1 and 2147483647.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100.')
    .toInt(),
  validateRequest
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  statusValidation,
  listTasksValidation
};
