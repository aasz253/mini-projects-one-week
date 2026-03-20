const express = require('express');
const router = express.Router();
const { getTasks, createTask, getTask, updateTask, deleteTask, toggleComplete, toggleFavorite, reorderTasks, shareTask, getStats } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.get('/stats', getStats);

router.put('/reorder', reorderTasks);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.put('/:id/toggle-complete', toggleComplete);
router.put('/:id/toggle-favorite', toggleFavorite);
router.post('/:id/share', shareTask);

module.exports = router;
