const express = require('express');
const router = express.Router();
const {
  getPayrolls,
  createPayroll,
  generatePayslip
} = require('../controllers/payrollController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', protect, getPayrolls);
router.post('/', protect, authorize('admin'), createPayroll);
router.get('/:id/payslip', protect, generatePayslip);

module.exports = router;
