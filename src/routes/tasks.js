const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getCategories,
  getAllTags
} = require('../controllers/taskController');
const { validateTask, validateTaskUpdate } = require('../middleware/validation');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', validateTask, createTask);
router.get('/', getTasks);
router.get('/categories', getCategories);
router.get('/tags', getAllTags);
router.get('/:id', getTaskById);
router.put('/:id', validateTaskUpdate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;