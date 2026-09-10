const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignTask,
  assignTaskSprint,
  addTaskDependency,
  removeTaskDependency,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createTask);
router.route('/project/:projectId').get(getTasksByProject);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);
router.route('/:id/status').put(updateTaskStatus);
router.route('/:id/assign').put(assignTask);
router.route('/:id/sprint').put(assignTaskSprint);
router.route('/:id/dependencies').post(addTaskDependency);
router.route('/:id/dependencies/:dependencyId').delete(removeTaskDependency);

module.exports = router;
