const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('head', 'name email');
    res.json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('head', 'name email');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create department
// @route   POST /api/departments
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, head } = req.body;

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department name already exists' });
    }

    const department = await Department.create({ name, description, head });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, head } = req.body;

    if (name) {
      const existing = await Department.findOne({ name, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Department name already exists' });
      }
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, head },
      { new: true, runValidators: true }
    ).populate('head', 'name email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
