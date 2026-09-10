const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Manager/Lead/Developer)
const createTask = async (req, res, next) => {
  try {
    const {
      project,
      sprint,
      milestone,
      title,
      description,
      assignedTo,
      status,
      priority,
      storyPoints,
      dueDate,
      labels,
      dependencies,
    } = req.body;

    if (!project || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project ID and task title',
      });
    }

    const task = await Task.create({
      project,
      sprint: sprint || null,
      milestone: milestone || null,
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status: status || 'todo',
      priority: priority || 'medium',
      storyPoints: storyPoints !== undefined ? Number(storyPoints) : 0,
      dueDate: dueDate || null,
      labels: labels || [],
      dependencies: dependencies || [],
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('labels', 'name');
    await task.populate('sprint', 'name status');
    await task.populate('milestone', 'name status');

    // Automatically record activity
    await logActivity({
      project,
      user: req.user._id,
      action: `${req.user.name} created Task: ${task.title}`,
      entityType: 'Task',
      entityId: task._id,
    });

    // Notify assigned user if assigned to someone else
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        user: assignedTo,
        message: `${req.user.name} assigned you to task: "${task.title}"`,
        type: 'assignment',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project with search, filter, pagination, sorting
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      search,
      status,
      priority,
      assignedTo,
      sprint,
      milestone,
      label,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
      all = 'false', // if 'true', don't paginate (useful for full Kanban board)
    } = req.query;

    const query = { project: projectId };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (priority) {
      if (priority.includes(',')) {
        query.priority = { $in: priority.split(',') };
      } else {
        query.priority = priority;
      }
    }

    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignedTo;
      }
    }

    if (sprint) {
      if (sprint === 'none') {
        query.sprint = null;
      } else {
        query.sprint = sprint;
      }
    }

    if (milestone) {
      query.milestone = milestone;
    }

    if (label) {
      query.labels = label;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Task.countDocuments(query);

    let tasksQuery = Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('labels', 'name')
      .populate('sprint', 'name status')
      .populate('milestone', 'name status')
      .populate('dependencies', 'title status priority')
      .sort(sortOptions);

    if (all !== 'true') {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 50;
      const skip = (pageNum - 1) * limitNum;
      tasksQuery = tasksQuery.skip(skip).limit(limitNum);
    }

    const tasks = await tasksQuery;

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: {
        tasks,
        total,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 50,
        totalPages: Math.ceil(total / (parseInt(limit, 10) || 50)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('labels', 'name')
      .populate('sprint', 'name status')
      .populate('milestone', 'name status')
      .populate('dependencies', 'title status priority');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task details retrieved',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      storyPoints,
      dueDate,
      sprint,
      milestone,
      labels,
      dependencies,
    } = req.body;

    const oldStatus = task.status;
    const oldAssigned = task.assignedTo ? task.assignedTo.toString() : null;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (storyPoints !== undefined) task.storyPoints = Number(storyPoints);
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (sprint !== undefined) task.sprint = sprint || null;
    if (milestone !== undefined) task.milestone = milestone || null;
    if (labels !== undefined) task.labels = labels;
    if (dependencies !== undefined) task.dependencies = dependencies;

    await task.save();

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('labels', 'name');
    await task.populate('sprint', 'name status');
    await task.populate('milestone', 'name status');
    await task.populate('dependencies', 'title status priority');

    // If status changed
    if (status && status !== oldStatus) {
      await logActivity({
        project: task.project,
        user: req.user._id,
        action: `${req.user.name} moved "${task.title}" from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}`,
        entityType: 'Task',
        entityId: task._id,
      });

      if (task.assignedTo && task.assignedTo._id.toString() !== req.user._id.toString()) {
        await createNotification({
          user: task.assignedTo._id,
          message: `${req.user.name} moved your task "${task.title}" to ${status.toUpperCase()}`,
          type: 'assignment',
        });
      }
    }

    // If assigned to new person
    if (assignedTo && assignedTo.toString() !== oldAssigned && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        user: assignedTo,
        message: `${req.user.name} assigned you to task: "${task.title}"`,
        type: 'assignment',
      });
      await logActivity({
        project: task.project,
        user: req.user._id,
        action: `${req.user.name} assigned Task: "${task.title}" to ${task.assignedTo.name}`,
        entityType: 'Task',
        entityId: task._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (e.g. Kanban drag and drop)
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['todo', 'in-progress', 'review', 'done'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // Automated activity log
    await logActivity({
      project: task.project,
      user: req.user._id,
      action: `${req.user.name} moved "${task.title}" from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}`,
      entityType: 'Task',
      entityId: task._id,
    });

    // Automated notification
    if (task.assignedTo && task.assignedTo._id.toString() !== req.user._id.toString()) {
      await createNotification({
        user: task.assignedTo._id,
        message: `${req.user.name} updated status of "${task.title}" to ${status.toUpperCase()}`,
        type: 'assignment',
      });
    }

    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign task to a user
// @route   PUT /api/tasks/:id/assign
// @access  Private (Manager/Lead)
const assignTask = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.assignedTo = assignedTo || null;
    await task.save();
    await task.populate('assignedTo', 'name email avatar');

    if (task.assignedTo) {
      await logActivity({
        project: task.project,
        user: req.user._id,
        action: `${req.user.name} assigned "${task.title}" to ${task.assignedTo.name}`,
        entityType: 'Task',
        entityId: task._id,
      });

      if (task.assignedTo._id.toString() !== req.user._id.toString()) {
        await createNotification({
          user: task.assignedTo._id,
          message: `${req.user.name} assigned you to task: "${task.title}"`,
          type: 'assignment',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task assignment updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign task to a sprint
// @route   PUT /api/tasks/:id/sprint
// @access  Private (Manager/Lead)
const assignTaskSprint = async (req, res, next) => {
  try {
    const { sprint } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.sprint = sprint || null;
    await task.save();
    await task.populate('sprint', 'name status');

    res.status(200).json({
      success: true,
      message: 'Task sprint assignment updated',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add dependency to task
// @route   POST /api/tasks/:id/dependencies
// @access  Private
const addTaskDependency = async (req, res, next) => {
  try {
    const { dependencyId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (dependencyId.toString() === task._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'A task cannot depend on itself',
      });
    }

    if (task.dependencies.map((d) => d.toString()).includes(dependencyId.toString())) {
      return res.status(409).json({
        success: false,
        message: 'Dependency already added',
      });
    }

    task.dependencies.push(dependencyId);
    await task.save();
    await task.populate('dependencies', 'title status priority');

    res.status(200).json({
      success: true,
      message: 'Dependency added successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove dependency from task
// @route   DELETE /api/tasks/:id/dependencies/:dependencyId
// @access  Private
const removeTaskDependency = async (req, res, next) => {
  try {
    const { id: taskId, dependencyId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.dependencies = task.dependencies.filter(
      (d) => d.toString() !== dependencyId.toString()
    );
    await task.save();
    await task.populate('dependencies', 'title status priority');

    res.status(200).json({
      success: true,
      message: 'Dependency removed successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Manager/Lead/Creator)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await logActivity({
      project: task.project,
      user: req.user._id,
      action: `${req.user.name} deleted Task: "${task.title}"`,
      entityType: 'Task',
      entityId: task._id,
    });

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
