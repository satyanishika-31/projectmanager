const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const logActivity = require('../utils/activityLogger');

// @desc    Create a milestone
// @route   POST /api/milestones
// @access  Private (Manager/Lead)
const createMilestone = async (req, res, next) => {
  try {
    const { project, name, description, dueDate, status } = req.body;

    if (!project || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project ID and milestone name',
      });
    }

    const milestone = await Milestone.create({
      project,
      name,
      description: description || '',
      dueDate: dueDate || null,
      status: status || 'pending',
    });

    await logActivity({
      project,
      user: req.user._id,
      action: `${req.user.name} created Milestone: ${milestone.name}`,
      entityType: 'Milestone',
      entityId: milestone._id,
    });

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all milestones for a project
// @route   GET /api/milestones/project/:projectId
// @access  Private
const getMilestonesByProject = async (req, res, next) => {
  try {
    const milestones = await Milestone.find({ project: req.params.projectId }).sort({
      dueDate: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: 'Milestones retrieved successfully',
      data: milestones,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get milestone by ID
// @route   GET /api/milestones/:id
// @access  Private
const getMilestoneById = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Milestone details retrieved',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private (Manager/Lead)
const updateMilestone = async (req, res, next) => {
  try {
    const { name, description, dueDate, status } = req.body;
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    const wasCompleted = milestone.status === 'completed';

    if (name) milestone.name = name;
    if (description !== undefined) milestone.description = description;
    if (dueDate !== undefined) milestone.dueDate = dueDate;
    if (status) milestone.status = status;

    await milestone.save();

    if (!wasCompleted && status === 'completed') {
      await logActivity({
        project: milestone.project,
        user: req.user._id,
        action: `${req.user.name} completed Milestone: ${milestone.name}`,
        entityType: 'Milestone',
        entityId: milestone._id,
      });
    } else {
      await logActivity({
        project: milestone.project,
        user: req.user._id,
        action: `${req.user.name} updated Milestone: ${milestone.name}`,
        entityType: 'Milestone',
        entityId: milestone._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private (Manager/Lead)
const deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    await logActivity({
      project: milestone.project,
      user: req.user._id,
      action: `${req.user.name} deleted Milestone: ${milestone.name}`,
      entityType: 'Milestone',
      entityId: milestone._id,
    });

    await milestone.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMilestone,
  getMilestonesByProject,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
};
