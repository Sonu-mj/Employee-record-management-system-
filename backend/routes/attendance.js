const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getAttendance
} = require('../controllers/attendanceController');
const protect = require('../middleware/auth');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/', protect, getAttendance);

module.exports = router;
