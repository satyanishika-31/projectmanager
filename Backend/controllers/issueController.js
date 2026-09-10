const Issue = require('../models/Issue');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res, next) => {
  try {
    const {
      project,
      title,
      description,
      reproductionSteps,
      severity,
      assignedTo,
    } = req.body;

    if (!project || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project ID, title and description',
      });
    }

    const issue = await Issue.create({
      project,
      title,
      description,
      reproductionSteps: reproductionSteps || '',
      severity: severity || 'medium',
      status: 'open',
      assignedTo: assignedTo || null,
      reportedBy: req.user._id,
    });

    await issue.populate('reportedBy', 'name email avatar');
    await issue.populate('assignedTo', 'name email avatar');

    // Automatically record activity
    const severityLabel = issue.severity === 'critical' ? 'Critical Issue' : 'Issue';
    await logActivity({
      project,
      user: req.user._id,
      action: `${req.user.name} created ${severityLabel}: "${issue.title}"`,
      entityType: 'Issue',
      entityId: issue._id,
    });

    // Notify assigned user if specified
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        user: assignedTo,
        message: `${req.user.name} assigned you to issue: "${issue.title}"`,
        type: 'issue',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get issues by project with filtering and pagination
// @route   GET /api/issues/project/:projectId
// @access  Private
const getIssuesByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      search,
      severity,
      status,
      assignedTo,
      reportedBy,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { project: projectId };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (severity) {
      if (severity.includes(',')) {
        query.severity = { $in: severity.split(',') };
      } else {
        query.severity = severity;
      }
    }

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (assignedTo) {
      query.assignedTo = assignedTo === 'unassigned' ? null : assignedTo;
    }

    if (reportedBy) {
      query.reportedBy = reportedBy;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Issue.countDocuments(query);
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Issues retrieved successfully',
      data: {
        issues,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get issue by ID
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue details retrieved',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
const updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const {
      title,
      description,
      reproductionSteps,
      severity,
      status,
      assignedTo,
      resolution,
    } = req.body;

    if (title) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (reproductionSteps !== undefined) issue.reproductionSteps = reproductionSteps;
    if (severity) issue.severity = severity;
    if (status) issue.status = status;
    if (assignedTo !== undefined) issue.assignedTo = assignedTo || null;
    if (resolution !== undefined) issue.resolution = resolution;

    await issue.save();
    await issue.populate('reportedBy', 'name email avatar');
    await issue.populate('assignedTo', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue status
// @route   PUT /api/issues/:id/status
// @access  Private
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    issue.status = status;
    await issue.save();

    await logActivity({
      project: issue.project,
      user: req.user._id,
      action: `${req.user.name} changed status of Issue: "${issue.title}" to ${status.toUpperCase()}`,
      entityType: 'Issue',
      entityId: issue._id,
    });

    if (issue.assignedTo && issue.assignedTo._id.toString() !== req.user._id.toString()) {
      await createNotification({
        user: issue.assignedTo._id,
        message: `${req.user.name} updated issue "${issue.title}" to ${status.toUpperCase()}`,
        type: 'issue',
      });
    }

    res.status(200).json({
      success: true,
      message: `Issue status updated to ${status}`,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign issue to user
// @route   PUT /api/issues/:id/assign
// @access  Private
const assignIssue = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    issue.assignedTo = assignedTo || null;
    await issue.save();
    await issue.populate('assignedTo', 'name email avatar');

    if (issue.assignedTo) {
      await logActivity({
        project: issue.project,
        user: req.user._id,
        action: `${req.user.name} assigned Issue: "${issue.title}" to ${issue.assignedTo.name}`,
        entityType: 'Issue',
        entityId: issue._id,
      });

      if (issue.assignedTo._id.toString() !== req.user._id.toString()) {
        await createNotification({
          user: issue.assignedTo._id,
          message: `${req.user.name} assigned you to issue: "${issue.title}"`,
          type: 'issue',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Issue assignment updated',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve issue
// @route   PUT /api/issues/:id/resolve
// @access  Private
const resolveIssue = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    const issue = await Issue.findById(req.params.id).populate('reportedBy', 'name email avatar');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    issue.status = 'resolved';
    if (resolution) issue.resolution = resolution;
    await issue.save();

    await logActivity({
      project: issue.project,
      user: req.user._id,
      action: `${req.user.name} resolved Issue: "${issue.title}"`,
      entityType: 'Issue',
      entityId: issue._id,
    });

    if (issue.reportedBy && issue.reportedBy._id.toString() !== req.user._id.toString()) {
      await createNotification({
        user: issue.reportedBy._id,
        message: `${req.user.name} resolved the issue you reported: "${issue.title}"`,
        type: 'issue',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue resolved successfully',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    await logActivity({
      project: issue.project,
      user: req.user._id,
      action: `${req.user.name} deleted Issue: "${issue.title}"`,
      entityType: 'Issue',
      entityId: issue._id,
    });

    await issue.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getIssuesByProject,
  getIssueById,
  updateIssue,
  updateIssueStatus,
  assignIssue,
  resolveIssue,
  deleteIssue,
};
