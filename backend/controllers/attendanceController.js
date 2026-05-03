const Attendance = require('../models/Attendance');

// @desc    Check in
// @route   POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    const now = new Date();

    // Check if already checked in today
    let record = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (record && record.checkIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    if (!record) {
      record = await Attendance.create({
        employee: req.user._id,
        date: today,
        checkIn: now,
        status: now.getHours() >= 10 ? 'late' : 'present'
      });
    } else {
      record.checkIn = now;
      record.status = now.getHours() >= 10 ? 'late' : 'present';
      await record.save();
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check out
// @route   POST /api/attendance/checkout
exports.checkOut = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    const now = new Date();

    const record = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, message: 'Must check in first' });
    }

    if (record.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    record.checkOut = now;

    // Calculate if half-day (less than 6 hours)
    const hours = (now - record.checkIn) / (1000 * 60 * 60);
    if (hours < 6) {
      record.status = 'half-day';
    }

    await record.save();
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
exports.getAttendance = async (req, res) => {
  try {
    const { employee, date, startDate, endDate, page = 1, limit = 10 } = req.query;
    let query = {};

    // Employees see only their own records
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (employee) {
      query.employee = employee;
    }

    if (date) {
      query.date = new Date(date).setHours(0, 0, 0, 0);
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).setHours(0, 0, 0, 0),
        $lte: new Date(endDate).setHours(0, 0, 0, 0)
      };
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('employee', 'name email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: records.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
