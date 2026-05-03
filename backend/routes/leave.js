const express = require('express');
const router = express.Router();
const {
  getLeaves,
  createLeave,
  approveLeave,
  rejectLeave
} = require('../controllers/leaveController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', protect, getLeaves);
router.post('/', protect, createLeave);
router.put('/:id/approve', protect, authorize('admin'), approveLeave);
router.put('/:id/reject', protect, authorize('admin'), rejectLeave);

module.exports = router;
