const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Organization = require('../models/Organization');
const OrganizationMember = require('../models/OrganizationMember');
const User = require('../models/User');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const Sprint = require('../models/Sprint');
const Milestone = require('../models/Milestone');
const Activity = require('../models/Activity');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Org Admin / Member)
const createProject = async (req, res, next) => {
  try {
    const { name, description, organization, manager, status, startDate, endDate } = req.body;

    if (!name || !organization) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project name and organization ID',
      });
    }

    // Verify organization membership
    const org = await Organization.findById(organization);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    const orgMember = await OrganizationMember.findOne({
      organization,
      user: req.user._id,
    });

    if (org.owner.toString() !== req.user._id.toString() && !orgMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this organization',
      });
    }

    const projectManager = manager || req.user._id;

    const project = await Project.create({
      name,
      description: description || '',
      organization,
      manager: projectManager,
      status: status || 'planning',
      startDate: startDate || null,
      endDate: endDate || null,
    });

    // Add manager as project member with 'manager' role
    await ProjectMember.create({
      project: project._id,
      user: projectManager,
      role: 'manager',
    });

    // If creator is not the manager, also add creator as manager/lead
    if (projectManager.toString() !== req.user._id.toString()) {
      await ProjectMember.create({
        project: project._id,
        user: req.user._id,
        role: 'manager',
      });
    }

    await logActivity({
      project: project._id,
      user: req.user._id,
      action: `${req.user.name} created Project: ${project.name}`,
      entityType: 'Project',
      entityId: project._id,
    });

    await project.populate('manager', 'name email avatar');
    await project.populate('organization', 'name');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all accessible projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { organization } = req.query;

    // Find orgs where user is admin or owner
    let adminOrgIds = [];
    if (organization) {
      const org = await Organization.findById(organization);
      const isOwner = org && org.owner.toString() === req.user._id.toString();
      const isAdmin = await OrganizationMember.findOne({
        organization,
        user: req.user._id,
        role: 'admin',
      });
      if (isOwner || isAdmin) {
        adminOrgIds.push(organization);
      }
    } else {
      const ownedOrgs = await Organization.find({ owner: req.user._id }).select('_id');
      const adminMemberships = await OrganizationMember.find({
        user: req.user._id,
        role: 'admin',
      }).select('organization');

      adminOrgIds = [
        ...ownedOrgs.map((o) => o._id.toString()),
        ...adminMemberships.map((m) => m.organization.toString()),
      ];
    }

    // Find projects where user is an explicit project member
    const projectMemberships = await ProjectMember.find({ user: req.user._id }).select('project role');
    const memberProjectIds = projectMemberships.map((pm) => pm.project);

    let filter = {
      $or: [
        { _id: { $in: memberProjectIds } },
        { manager: req.user._id },
        { organization: { $in: adminOrgIds } },
      ],
    };

    if (organization) {
      filter.organization = organization;
    }

    const projects = await Project.find(filter)
      .populate('organization', 'name')
      .populate('manager', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Attach role and progress to each project
    const enrichedProjects = await Promise.all(
      projects.map(async (p) => {
        const pm = projectMemberships.find(
          (m) => m.project.toString() === p._id.toString()
        );
        let role = pm ? pm.role : 'member';
        if (p.manager._id.toString() === req.user._id.toString() || adminOrgIds.includes(p.organization._id.toString())) {
          role = 'manager';
        }

        const totalTasks = await Task.countDocuments({ project: p._id });
        const completedTasks = await Task.countDocuments({ project: p._id, status: 'done' });
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...p.toObject(),
          currentUserRole: role,
          totalTasks,
          completedTasks,
          progress,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: enrichedProjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('organization', 'name owner')
      .populate('manager', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Verify membership or org admin
    const isOrgOwner = project.organization.owner.toString() === req.user._id.toString();
    const orgMembership = await OrganizationMember.findOne({
      organization: project.organization._id,
      user: req.user._id,
    });
    const isOrgAdmin = orgMembership && orgMembership.role === 'admin';
    const isManager = project.manager._id.toString() === req.user._id.toString();
    const projectMember = await ProjectMember.findOne({
      project: project._id,
      user: req.user._id,
    });

    if (!isOrgOwner && !isOrgAdmin && !isManager && !projectMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this project',
      });
    }

    const role = isOrgOwner || isOrgAdmin || isManager ? 'manager' : (projectMember ? projectMember.role : 'developer');

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({ project: project._id, status: 'done' });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      message: 'Project details retrieved',
      data: {
        ...project.toObject(),
        currentUserRole: role,
        totalTasks,
        completedTasks,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Manager / Org Admin)
const updateProject = async (req, res, next) => {
  try {
    const { name, description, manager, status, startDate, endDate } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;

    if (manager && manager !== project.manager.toString()) {
      project.manager = manager;
      // Ensure new manager is a project member with 'manager' role
      const existingPm = await ProjectMember.findOne({ project: project._id, user: manager });
      if (existingPm) {
        existingPm.role = 'manager';
        await existingPm.save();
      } else {
        await ProjectMember.create({
          project: project._id,
          user: manager,
          role: 'manager',
        });
      }
    }

    await project.save();
    await project.populate('manager', 'name email avatar');

    await logActivity({
      project: project._id,
      user: req.user._id,
      action: `${req.user.name} updated project details`,
      entityType: 'Project',
      entityId: project._id,
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Manager / Org Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Cascade delete project dependencies
    await ProjectMember.deleteMany({ project: project._id });
    await Task.deleteMany({ project: project._id });
    await Issue.deleteMany({ project: project._id });
    await Sprint.deleteMany({ project: project._id });
    await Milestone.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and associated data deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project members
// @route   GET /api/projects/:id/members
// @access  Private
const getProjectMembers = async (req, res, next) => {
  try {
    const members = await ProjectMember.find({ project: req.params.id }).populate(
      'user',
      'name email avatar'
    );

    res.status(200).json({
      success: true,
      message: 'Project members retrieved successfully',
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Manager)
const addProjectMember = async (req, res, next) => {
  try {
    const { userId, email, role } = req.body;
    const projectId = req.params.id;

    let userToAdd;
    if (userId) {
      userToAdd = await User.findById(userId);
    } else if (email) {
      userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const existingMember = await ProjectMember.findOne({
      project: projectId,
      user: userToAdd._id,
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    const validRoles = ['manager', 'lead', 'developer', 'stakeholder'];
    const assignedRole = role && validRoles.includes(role) ? role : 'developer';

    const projectMember = await ProjectMember.create({
      project: projectId,
      user: userToAdd._id,
      role: assignedRole,
    });

    await projectMember.populate('user', 'name email avatar');

    // Notify added user
    await createNotification({
      user: userToAdd._id,
      message: `You were added to project as a ${assignedRole}`,
      type: 'invitation',
    });

    await logActivity({
      project: projectId,
      user: req.user._id,
      action: `${req.user.name} added ${userToAdd.name} as ${assignedRole}`,
      entityType: 'Project',
      entityId: projectId,
    });

    res.status(201).json({
      success: true,
      message: 'Member added to project successfully',
      data: projectMember,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project member role
// @route   PUT /api/projects/:id/members/:userId
// @access  Private (Manager)
const updateProjectMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id: projectId, userId } = req.params;

    const validRoles = ['manager', 'lead', 'developer', 'stakeholder'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    const project = await Project.findById(projectId);
    if (project.manager.toString() === userId && role !== 'manager') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote the primary project manager',
      });
    }

    const member = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Project member not found',
      });
    }

    member.role = role;
    await member.save();
    await member.populate('user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Project member role updated successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Manager)
const removeProjectMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (project.manager.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the primary project manager',
      });
    }

    const member = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Project member not found',
      });
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project member removed successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate Project Dashboard dynamically
// @route   GET /api/projects/:id/dashboard
// @access  Private (Project Member)
const getProjectDashboard = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId).populate('manager', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Task counts
    const totalTasks = await Task.countDocuments({ project: projectId });
    const completedTasks = await Task.countDocuments({ project: projectId, status: 'done' });
    const pendingTasks = await Task.countDocuments({ project: projectId, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ project: projectId, status: 'in-progress' });
    const reviewTasks = await Task.countDocuments({ project: projectId, status: 'review' });

    // Issue counts
    const totalIssues = await Issue.countDocuments({ project: projectId });
    const openIssues = await Issue.countDocuments({
      project: projectId,
      status: { $in: ['open', 'in-progress'] },
    });
    const resolvedIssues = await Issue.countDocuments({
      project: projectId,
      status: { $in: ['resolved', 'closed'] },
    });

    // Progress percentage: completed tasks / total tasks * 100 (safely handle 0 tasks)
    const projectProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Upcoming milestones
    const upcomingMilestones = await Milestone.find({
      project: projectId,
      status: { $ne: 'completed' },
    })
      .sort({ dueDate: 1 })
      .limit(5);

    // Current active sprint
    const currentSprint = await Sprint.findOne({
      project: projectId,
      status: 'active',
    });

    // Team members & workload
    const members = await ProjectMember.find({ project: projectId }).populate(
      'user',
      'name email avatar'
    );

    const teamWorkload = await Promise.all(
      members.map(async (m) => {
        const assignedActiveCount = await Task.countDocuments({
          project: projectId,
          assignedTo: m.user._id,
          status: { $in: ['todo', 'in-progress', 'review'] },
        });
        const assignedCompletedCount = await Task.countDocuments({
          project: projectId,
          assignedTo: m.user._id,
          status: 'done',
        });
        return {
          user: m.user,
          role: m.role,
          activeTasks: assignedActiveCount,
          completedTasks: assignedCompletedCount,
          totalAssigned: assignedActiveCount + assignedCompletedCount,
        };
      })
    );

    // Recent project activity
    const recentActivity = await Activity.find({ project: projectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name avatar');

    // Overdue tasks
    const now = new Date();
    const overdueTasks = await Task.find({
      project: projectId,
      status: { $ne: 'done' },
      dueDate: { $lt: now },
    })
      .populate('assignedTo', 'name avatar')
      .sort({ dueDate: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      message: 'Project dashboard metrics calculated successfully',
      data: {
        project,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        reviewTasks,
        totalIssues,
        openIssues,
        resolvedIssues,
        projectProgress,
        upcomingMilestones,
        currentSprint,
        teamWorkload,
        recentActivity,
        overdueTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  getProjectDashboard,
};
