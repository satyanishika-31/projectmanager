const Organization = require('../models/Organization');
const OrganizationMember = require('../models/OrganizationMember');
const User = require('../models/User');

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private
const createOrganization = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an organization name',
      });
    }

    const organization = await Organization.create({
      name,
      description: description || '',
      owner: req.user._id,
    });

    // Automatically add owner as admin member
    await OrganizationMember.create({
      organization: organization._id,
      user: req.user._id,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizations for current user
// @route   GET /api/organizations
// @access  Private
const getOrganizations = async (req, res, next) => {
  try {
    const memberships = await OrganizationMember.find({ user: req.user._id })
      .populate({
        path: 'organization',
        populate: { path: 'owner', select: 'name email avatar' },
      });

    const organizations = memberships
      .filter((m) => m.organization)
      .map((m) => ({
        ...m.organization.toObject(),
        currentUserRole: m.role,
      }));

    res.status(200).json({
      success: true,
      message: 'Organizations retrieved successfully',
      data: organizations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization by ID
// @route   GET /api/organizations/:id
// @access  Private
const getOrganizationById = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id).populate(
      'owner',
      'name email avatar'
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Verify membership
    const membership = await OrganizationMember.findOne({
      organization: organization._id,
      user: req.user._id,
    });

    if (!membership && organization.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this organization',
      });
    }

    const memberCount = await OrganizationMember.countDocuments({
      organization: organization._id,
    });

    res.status(200).json({
      success: true,
      message: 'Organization details retrieved',
      data: {
        ...organization.toObject(),
        currentUserRole: membership ? membership.role : 'admin',
        memberCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Admin)
const updateOrganization = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (Owner only)
const deleteOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (organization.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the organization owner can delete the organization',
      });
    }

    await OrganizationMember.deleteMany({ organization: organization._id });
    await organization.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization members
// @route   GET /api/organizations/:id/members
// @access  Private (Member)
const getOrganizationMembers = async (req, res, next) => {
  try {
    const members = await OrganizationMember.find({
      organization: req.params.id,
    }).populate('user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Members retrieved successfully',
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to organization
// @route   POST /api/organizations/:id/members
// @access  Private (Admin)
const addOrganizationMember = async (req, res, next) => {
  try {
    const { email, userId, role } = req.body;
    const orgId = req.params.id;

    let userToAdd;
    if (userId) {
      userToAdd = await User.findById(userId);
    } else if (email) {
      userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found with provided credentials',
      });
    }

    const existingMember = await OrganizationMember.findOne({
      organization: orgId,
      user: userToAdd._id,
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: 'User is already a member of this organization',
      });
    }

    const member = await OrganizationMember.create({
      organization: orgId,
      user: userToAdd._id,
      role: role && ['admin', 'member'].includes(role) ? role : 'member',
    });

    await member.populate('user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Member added to organization successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization member role
// @route   PUT /api/organizations/:id/members/:userId
// @access  Private (Admin)
const updateOrganizationMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id: orgId, userId } = req.params;

    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'admin' or 'member'",
      });
    }

    const org = await Organization.findById(orgId);
    if (org.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot change the organization owner's role",
      });
    }

    const member = await OrganizationMember.findOne({
      organization: orgId,
      user: userId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this organization',
      });
    }

    member.role = role;
    await member.save();
    await member.populate('user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from organization
// @route   DELETE /api/organizations/:id/members/:userId
// @access  Private (Admin)
const removeOrganizationMember = async (req, res, next) => {
  try {
    const { id: orgId, userId } = req.params;

    const org = await Organization.findById(orgId);
    if (org.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the organization owner',
      });
    }

    const member = await OrganizationMember.findOne({
      organization: orgId,
      user: userId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this organization',
      });
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Member removed from organization successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,
};
