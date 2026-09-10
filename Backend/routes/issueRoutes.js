const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssuesByProject,
  getIssueById,
  updateIssue,
  updateIssueStatus,
  assignIssue,
  resolveIssue,
  deleteIssue,
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createIssue);
router.route('/project/:projectId').get(getIssuesByProject);
router.route('/:id').get(getIssueById).put(updateIssue).delete(deleteIssue);
router.route('/:id/status').put(updateIssueStatus);
router.route('/:id/assign').put(assignIssue);
router.route('/:id/resolve').put(resolveIssue);

module.exports = router;
