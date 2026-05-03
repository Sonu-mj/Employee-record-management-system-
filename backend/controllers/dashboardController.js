const User = require('../models/User');
const Department = require('../models/Department');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ isActive: true });
    const totalDepartments = await Department.countDocuments();

    // Today's attendance
    const today = new Date().setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({
      date: today,
      status: { $in: ['present', 'late', 'half-day'] }
    });

    // Pending leaves
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // Recent leaves (last 5)
    const recentLeaves = await Leave.find()
      .populate('employee', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Department-wise employee count
    const deptStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$dept.name', count: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments,
        todayAttendance,
        pendingLeaves,
        recentLeaves,
        deptStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
