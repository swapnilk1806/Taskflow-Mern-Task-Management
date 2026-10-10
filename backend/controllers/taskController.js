const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getTaskInput(body) {
  const fields = ['title', 'description', 'status', 'priority', 'dueDate'];
  return fields.reduce((input, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      input[field] = body[field];
    }
    return input;
  }, {});
}

const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({
    ...getTaskInput(req.body),
    user: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: { task }
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    priority,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 10
  } = req.query;
  const filter = { user: req.user._id };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    const searchPattern = new RegExp(escapeRegularExpression(search), 'i');
    filter.$or = [
      { title: searchPattern },
      { description: searchPattern }
    ];
  }

  const numericPage = Number(page);
  const pageSize = Number(limit);
  const sortDirection = order === 'asc' ? 1 : -1;
  const skip = (numericPage - 1) * pageSize;
  const sort = { [sortBy]: sortDirection, _id: sortDirection };

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(pageSize),
    Task.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully.',
    data: tasks,
    pagination: {
      page: numericPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully.',
    data: { task }
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: getTaskInput(req.body) },
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    data: { task }
  });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { status: req.body.status } },
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Task status updated successfully.',
    data: { task }
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully.',
    data: { task }
  });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const [stats = {}] = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        pendingTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'completed'] },
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', now] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalTasks: 1,
        pendingTasks: 1,
        inProgressTasks: 1,
        completedTasks: 1,
        overdueTasks: 1,
        completionPercentage: {
          $cond: [
            { $gt: ['$totalTasks', 0] },
            {
              $round: [
                { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                2
              ]
            },
            0
          ]
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Task statistics retrieved successfully.',
    data: {
      totalTasks: stats.totalTasks || 0,
      pendingTasks: stats.pendingTasks || 0,
      inProgressTasks: stats.inProgressTasks || 0,
      completedTasks: stats.completedTasks || 0,
      overdueTasks: stats.overdueTasks || 0,
      completionPercentage: stats.completionPercentage || 0
    }
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats
};
