const Task = require('../models/Task');
const { getPaginationParams, buildPaginationResponse } = require('../utils/paginationUtils');

class TaskService {
  async createTask(taskData, userId) {
    const task = new Task({
      ...taskData,
      userId,
      status: taskData.status || 'pending'
    });

    await task.save();
    return task;
  }

  async getTasks(userId, filters = {}) {
    const { status, page = 1, limit = 10 } = filters;
    const { skip, limit: itemsPerPage } = getPaginationParams(page, limit);

    // Build filter
    const filter = { userId };
    if (status && ['pending', 'completed'].includes(status)) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage);

    const total = await Task.countDocuments(filter);
    const pagination = buildPaginationResponse(page, limit, total, tasks.length);

    return {
      tasks,
      pagination
    };
  }

  async getTaskById(taskId, userId) {
    const task = await Task.findOne({
      _id: taskId,
      userId
    });

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    return task;
  }

  async updateTask(taskId, userId, updates) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    return task;
  }

  async deleteTask(taskId, userId) {
    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId
    });

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    return task;
  }
}

module.exports = new TaskService();
