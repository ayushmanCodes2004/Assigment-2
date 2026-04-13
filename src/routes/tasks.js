const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { validateTask, validateTaskUpdate } = require('../middleware/validation');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', validateTask, createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', validateTaskUpdate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;