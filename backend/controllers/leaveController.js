const Leave = require('../models/Leave');

// @desc    Get leaves (admin sees all, employee sees own)
// @route   GET /api/leaves
exports.getLeaves = async (req, res) => {
  try {
    const { status, employee, page = 1, limit = 10 } = req.query;
    let query = {};

    // Employees can only see their own leaves
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (employee) {
      query.employee = employee;
    }

    if (status) query.status = status;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: leaves.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: leaves
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create leave request
// @route   POST /api/leaves
exports.createLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      type,
      startDate,
      endDate,
      reason
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve leave
// @route   PUT /api/leaves/:id/approve
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Leave already processed' });
    }

    leave.status = 'approved';
    leave.reviewedBy = req.user._id;
    leave.reviewComment = req.body.comment || '';
    await leave.save();

    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject leave
// @route   PUT /api/leaves/:id/reject
exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Leave already processed' });
    }

    leave.status = 'rejected';
    leave.reviewedBy = req.user._id;
    leave.reviewComment = req.body.comment || '';
    await leave.save();

    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
