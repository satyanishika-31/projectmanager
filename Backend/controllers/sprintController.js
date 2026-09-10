const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const logActivity = require('../utils/activityLogger');

// @desc    Create a sprint
// @route   POST /api/sprints
// @access  Private (Manager/Lead)
const createSprint = async (req, res, next) => {
  try {
    const { project, name, goal, startDate, endDate, status } = req.body;

    if (!project || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project ID and sprint name',
      });
    }

    const sprint = await Sprint.create({
      project,
      name,
      goal: goal || '',
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || 'planned',
    });

    await logActivity({
      project,
      user: req.user._id,
      action: `${req.user.name} created Sprint: ${sprint.name}`,
      entityType: 'Sprint',
      entityId: sprint._id,
    });

    res.status(201).json({
      success: true,
      message: 'Sprint created successfully',
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sprints by project
// @route   GET /api/sprints/project/:projectId
// @access  Private
const getSprintsByProject = async (req, res, next) => {
  try {
    const sprints = await Sprint.find({ project: req.params.projectId }).sort({
      createdAt: -1,
    });

    // Calculate story points and task stats for each sprint
    const enrichedSprints = await Promise.all(
      sprints.map(async (s) => {
        const tasks = await Task.find({ sprint: s._id });
        const totalPoints = tasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
        const completedPoints = tasks
          .filter((t) => t.status === 'done')
          .reduce((acc, t) => acc + (t.storyPoints || 0), 0);
        const completedCount = tasks.filter((t) => t.status === 'done').length;

        return {
          ...s.toObject(),
          totalTasks: tasks.length,
          completedTasks: completedCount,
          totalPoints,
          completedPoints,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Sprints retrieved successfully',
      data: enrichedSprints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sprint by ID
// @route   GET /api/sprints/:id
// @access  Private
const getSprintById = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    const tasks = await Task.find({ sprint: sprint._id }).populate('assignedTo', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Sprint details retrieved',
      data: {
        ...sprint.toObject(),
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
// @access  Private (Manager/Lead)
const updateSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate, status } = req.body;
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    if (name) sprint.name = name;
    if (goal !== undefined) sprint.goal = goal;
    if (startDate !== undefined) sprint.startDate = startDate;
    if (endDate !== undefined) sprint.endDate = endDate;
    if (status) sprint.status = status;

    await sprint.save();

    await logActivity({
      project: sprint.project,
      user: req.user._id,
      action: `${req.user.name} updated Sprint: ${sprint.name}`,
      entityType: 'Sprint',
      entityId: sprint._id,
    });

    res.status(200).json({
      success: true,
      message: 'Sprint updated successfully',
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start sprint
// @route   PUT /api/sprints/:id/start
// @access  Private (Manager/Lead)
const startSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    sprint.status = 'active';
    if (!sprint.startDate) sprint.startDate = new Date();
    await sprint.save();

    await logActivity({
      project: sprint.project,
      user: req.user._id,
      action: `${req.user.name} started Sprint: ${sprint.name}`,
      entityType: 'Sprint',
      entityId: sprint._id,
    });

    res.status(200).json({
      success: true,
      message: `Sprint '${sprint.name}' is now active`,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete sprint
// @route   PUT /api/sprints/:id/complete
// @access  Private (Manager/Lead)
const completeSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    sprint.status = 'completed';
    if (!sprint.endDate) sprint.endDate = new Date();
    await sprint.save();

    await logActivity({
      project: sprint.project,
      user: req.user._id,
      action: `${req.user.name} completed Sprint: ${sprint.name}`,
      entityType: 'Sprint',
      entityId: sprint._id,
    });

    res.status(200).json({
      success: true,
      message: `Sprint '${sprint.name}' completed`,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
// @access  Private (Manager/Lead)
const deleteSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    // Unassign tasks from deleted sprint
    await Task.updateMany({ sprint: sprint._id }, { $unset: { sprint: '' } });

    await logActivity({
      project: sprint.project,
      user: req.user._id,
      action: `${req.user.name} deleted Sprint: ${sprint.name}`,
      entityType: 'Sprint',
      entityId: sprint._id,
    });

    await sprint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sprint deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSprint,
  getSprintsByProject,
  getSprintById,
  updateSprint,
  startSprint,
  completeSprint,
  deleteSprint,
};
