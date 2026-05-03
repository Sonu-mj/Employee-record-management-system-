const Announcement = require('../models/Announcement');

// @desc    Get announcements
// @route   GET /api/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: announcements.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create announcement (admin only)
// @route   POST /api/announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      priority,
      postedBy: req.user._id
    });

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement (admin only)
// @route   DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
