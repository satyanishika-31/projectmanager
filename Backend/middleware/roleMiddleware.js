const Organization = require('../models/Organization');
const OrganizationMember = require('../models/OrganizationMember');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');

// Check Organization Membership and Role
const requireOrgRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const orgId =
        req.params.orgId ||
        req.params.organizationId ||
        req.params.id ||
        req.body.organization;

      if (!orgId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required for authorization',
        });
      }

      const org = await Organization.findById(orgId);
      if (!org) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      }

      // If user is owner, grant admin access automatically
      if (org.owner.toString() === req.user._id.toString()) {
        req.org = org;
        req.orgRole = 'admin';
        return next();
      }

      const membership = await OrganizationMember.findOne({
        organization: orgId,
        user: req.user._id,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not a member of this organization',
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Role '${membership.role}' does not have sufficient permissions`,
        });
      }

      req.org = org;
      req.orgMember = membership;
      req.orgRole = membership.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check Project Membership and Role
const requireProjectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const projectId =
        req.params.projectId ||
        req.params.id ||
        req.body.project;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required for authorization',
        });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      // Check organization membership first
      const org = await Organization.findById(project.organization);
      const isOrgOwner = org && org.owner.toString() === req.user._id.toString();
      const orgMembership = await OrganizationMember.findOne({
        organization: project.organization,
        user: req.user._id,
      });

      if (!isOrgOwner && !orgMembership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not belong to the organization of this project',
        });
      }

      // If org admin or org owner, grant manager-level access
      if (isOrgOwner || (orgMembership && orgMembership.role === 'admin')) {
        req.project = project;
        req.projectRole = 'manager';
        return next();
      }

      // If user is project manager directly
      if (project.manager.toString() === req.user._id.toString()) {
        req.project = project;
        req.projectRole = 'manager';
        return next();
      }

      // Check project membership
      const projectMember = await ProjectMember.findOne({
        project: projectId,
        user: req.user._id,
      });

      if (!projectMember) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not a member of this project',
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(projectMember.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Role '${projectMember.role}' is not authorized for this operation`,
        });
      }

      req.project = project;
      req.projectMember = projectMember;
      req.projectRole = projectMember.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireOrgRole,
  requireProjectRole,
};
