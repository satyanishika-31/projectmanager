const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const createNotification = require('../utils/notificationHelper');

// @desc    Create a comment on a task or issue
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { task, issue, text } = req.body;

    if (!text || (!task && !issue) || (task && issue)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment text and specify either task OR issue ID',
      });
    }

    const comment = await Comment.create({
      user: req.user._id,
      task: task || null,
      issue: issue || null,
      text,
    });

    await comment.populate('user', 'name email avatar');

    // Notify task assignee
    if (task) {
      const taskDoc = await Task.findById(task);
      if (
        taskDoc &&
        taskDoc.assignedTo &&
        taskDoc.assignedTo.toString() !== req.user._id.toString()
      ) {
        await createNotification({
          user: taskDoc.assignedTo,
          message: `${req.user.name} commented on your task: "${taskDoc.title}"`,
          type: 'comment',
        });
      }
    }

    // Notify issue reporter
    if (issue) {
      const issueDoc = await Issue.findById(issue);
      if (
        issueDoc &&
        issueDoc.reportedBy &&
        issueDoc.reportedBy.toString() !== req.user._id.toString()
      ) {
        await createNotification({
          user: issueDoc.reportedBy,
          message: `${req.user.name} commented on your issue: "${issueDoc.title}"`,
          type: 'comment',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a task
// @route   GET /api/comments/task/:taskId
// @access  Private
const getCommentsByTask = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: 'Task comments retrieved successfully',
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for an issue
// @route   GET /api/comments/issue/:issueId
// @access  Private
const getCommentsByIssue = async (req, res, next) => {
  try {
    const comments = await Comment.find({ issue: req.params.issueId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: 'Issue comments retrieved successfully',
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this comment',
      });
    }

    comment.text = text;
    await comment.save();
    await comment.populate('user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getCommentsByTask,
  getCommentsByIssue,
  updateComment,
  deleteComment,
};
