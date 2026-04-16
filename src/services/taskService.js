const Task = require('../models/Task');
const { getPaginationParams, buildPaginationResponse } = require('../utils/paginationUtils');
const reminderService = require('./reminderService');
const webhookService = require('./webhookService');

class TaskService {
  async createTask(taskData, userId) {
    const task = new Task({
      ...taskData,
      userId,
      status: taskData.status || 'pending',
      category: taskData.category || 'Other',
      tags: taskData.tags || []
    });

    await task.save();
    await reminderService.scheduleTaskReminder(task._id);

    return task;
  }

  async getTasks(userId, filters = {}) {
    const { status, category, tags, page = 1, limit = 10 } = filters;
    const { skip, limit: itemsPerPage } = getPaginationParams(page, limit);

    const filter = { userId };
    
    if (status && ['pending', 'completed'].includes(status)) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
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
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    const oldStatus = task.status;
    const oldDueDate = task.dueDate;

    Object.assign(task, updates);

    if (updates.status === 'completed' && oldStatus !== 'completed') {
      task.completedAt = new Date();
      reminderService.cancelTaskReminder(taskId);
      
      await task.save();
      await webhookService.sendTaskCompletionNotification(task);
    } else {
      await task.save();

      if (updates.dueDate && updates.dueDate.toString() !== oldDueDate.toString()) {
        task.reminderSent = false;
        await task.save();
        await reminderService.scheduleTaskReminder(taskId);
      }
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

    reminderService.cancelTaskReminder(taskId);

    return task;
  }

  async getCategories() {
    return ['Work', 'Personal', 'Urgent', 'Shopping', 'Health', 'Other'];
  }

  async getTasksByCategory(userId, category) {
    const tasks = await Task.find({ userId, category }).sort({ createdAt: -1 });
    return tasks;
  }

  async getAllTags(userId) {
    const tasks = await Task.find({ userId });
    const tagsSet = new Set();
    
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet).sort();
  }
}

module.exports = new TaskService();
