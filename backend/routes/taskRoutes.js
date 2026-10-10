const express = require('express');
const {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  getTaskStats,
  updateTask,
  updateTaskStatus
} = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');
const {
  createTaskValidation,
  listTasksValidation,
  statusValidation,
  taskIdValidation,
  updateTaskValidation
} = require('../validators/taskValidator');

const router = express.Router();

router.use(authenticate);

router.get('/stats', getTaskStats);
router.post('/', createTaskValidation, createTask);
router.get('/', listTasksValidation, getTasks);
router.get('/:id', taskIdValidation, getTask);
router.put('/:id', updateTaskValidation, updateTask);
router.patch('/:id/status', statusValidation, updateTaskStatus);
router.delete('/:id', taskIdValidation, deleteTask);

module.exports = router;
