const Label = require('../models/Label');

// @desc    Create a label
// @route   POST /api/labels
// @access  Private
const createLabel = async (req, res, next) => {
  try {
    const { name, project } = req.body;

    if (!name || !project) {
      return res.status(400).json({
        success: false,
        message: 'Please provide label name and project ID',
      });
    }

    const existingLabel = await Label.findOne({ name: name.trim(), project });
    if (existingLabel) {
      return res.status(409).json({
        success: false,
        message: 'Label already exists in this project',
      });
    }

    const label = await Label.create({
      name: name.trim(),
      project,
    });

    res.status(201).json({
      success: true,
      message: 'Label created successfully',
      data: label,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get labels by project
// @route   GET /api/labels/project/:projectId
// @access  Private
const getLabelsByProject = async (req, res, next) => {
  try {
    const labels = await Label.find({ project: req.params.projectId }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      message: 'Labels retrieved successfully',
      data: labels,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update label
// @route   PUT /api/labels/:id
// @access  Private
const updateLabel = async (req, res, next) => {
  try {
    const { name } = req.body;
    const label = await Label.findById(req.params.id);

    if (!label) {
      return res.status(404).json({
        success: false,
        message: 'Label not found',
      });
    }

    if (name) label.name = name.trim();
    await label.save();

    res.status(200).json({
      success: true,
      message: 'Label updated successfully',
      data: label,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete label
// @route   DELETE /api/labels/:id
// @access  Private
const deleteLabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.params.id);

    if (!label) {
      return res.status(404).json({
        success: false,
        message: 'Label not found',
      });
    }

    await label.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Label deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLabel,
  getLabelsByProject,
  updateLabel,
  deleteLabel,
};
