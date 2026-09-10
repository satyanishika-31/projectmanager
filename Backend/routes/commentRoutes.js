const express = require('express');
const router = express.Router();
const {
  createComment,
  getCommentsByTask,
  getCommentsByIssue,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createComment);
router.route('/task/:taskId').get(getCommentsByTask);
router.route('/issue/:issueId').get(getCommentsByIssue);
router.route('/:id').put(updateComment).delete(deleteComment);

module.exports = router;
