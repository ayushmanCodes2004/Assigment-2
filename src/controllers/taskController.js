const taskService = require('../services/taskService');

const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, status, category, tags } = req.body;
    const task = await taskService.createTask(
      { title, description, dueDate, status, category, tags },
      req.user.id
    );

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { status, category, tags, page, limit } = req.query;
    const result = await taskService.getTasks(req.user.id, { 
      status, 
      category, 
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined,
      page, 
      limit 
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id, req.user.id);

    res.json({ task });
  } catch (error) {
    if (error.message === 'TASK_NOT_FOUND') {
      return res.status(404).json({
        error: 'Task not found'
      });
    }
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskService.updateTask(id, req.user.id, req.body);

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    if (error.message === 'TASK_NOT_FOUND') {
      return res.status(404).json({
        error: 'Task not found'
      });
    }
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    await taskService.deleteTask(id, req.user.id);

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    if (error.message === 'TASK_NOT_FOUND') {
      return res.status(404).json({
        error: 'Task not found'
      });
    }
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await taskService.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

const getAllTags = async (req, res, next) => {
  try {
    const tags = await taskService.getAllTags(req.user.id);
    res.json({ tags });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getCategories,
  getAllTags
};