const Team = require('../models/Team');
const OrganizationMember = require('../models/OrganizationMember');
const Organization = require('../models/Organization');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Org Admin)
const createTeam = async (req, res, next) => {
  try {
    const { name, organization, leader, members } = req.body;

    if (!name || !organization) {
      return res.status(400).json({
        success: false,
        message: 'Please provide team name and organization ID',
      });
    }

    // Verify user is org admin or owner
    const org = await Organization.findById(organization);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    const membership = await OrganizationMember.findOne({
      organization,
      user: req.user._id,
    });

    if (org.owner.toString() !== req.user._id.toString() && (!membership || membership.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only organization admins can create teams',
      });
    }

    const team = await Team.create({
      name,
      organization,
      leader: leader || req.user._id,
      members: members || [req.user._id],
    });

    await team.populate('leader', 'name email avatar');
    await team.populate('members', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teams (optionally by organization)
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res, next) => {
  try {
    const { organization } = req.query;
    let query = {};

    if (organization) {
      query.organization = organization;
    } else {
      // Find all orgs user belongs to
      const userOrgs = await OrganizationMember.find({ user: req.user._id }).select('organization');
      const orgIds = userOrgs.map((o) => o.organization);
      query.organization = { $in: orgIds };
    }

    const teams = await Team.find(query)
      .populate('organization', 'name')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Teams retrieved successfully',
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('organization', 'name owner')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Team details retrieved',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Org Admin or Leader)
const updateTeam = async (req, res, next) => {
  try {
    const { name, leader } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    if (name) team.name = name;
    if (leader) team.leader = leader;

    await team.save();
    await team.populate('leader', 'name email avatar');
    await team.populate('members', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Org Admin)
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private
const addTeamMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a userId to add',
      });
    }

    if (team.members.map((m) => m.toString()).includes(userId.toString())) {
      return res.status(409).json({
        success: false,
        message: 'User is already a member of this team',
      });
    }

    team.members.push(userId);
    await team.save();
    await team.populate('members', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member added to team successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
const removeTeamMember = async (req, res, next) => {
  try {
    const { id: teamId, userId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    team.members = team.members.filter((m) => m.toString() !== userId.toString());
    await team.save();
    await team.populate('members', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member removed from team successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
};
