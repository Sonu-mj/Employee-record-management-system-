const Payroll = require('../models/Payroll');

// @desc    Get payroll records
// @route   GET /api/payroll
exports.getPayrolls = async (req, res) => {
  try {
    const { employee, month, year, page = 1, limit = 10 } = req.query;
    let query = {};

    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (employee) {
      query.employee = employee;
    }

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const total = await Payroll.countDocuments(query);
    const payrolls = await Payroll.find(query)
      .populate('employee', 'name email position')
      .sort({ year: -1, month: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: payrolls.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: payrolls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create/update payroll record
// @route   POST /api/payroll
exports.createPayroll = async (req, res) => {
  try {
    const { employee, month, year, basicSalary, hra, da, bonus, deductions } = req.body;

    const netSalary = basicSalary + (hra || 0) + (da || 0) + (bonus || 0) - (deductions || 0);

    // Upsert: update if exists, create if not
    const payroll = await Payroll.findOneAndUpdate(
      { employee, month, year },
      { basicSalary, hra, da, bonus, deductions, netSalary },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('employee', 'name email position');

    res.status(201).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate payslip for an employee
// @route   GET /api/payroll/:id/payslip
exports.generatePayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee', 'name email position department');
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    // Employees can only see their own payslips
    if (req.user.role === 'employee' && payroll.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const payslip = {
      company: 'ERMS Corp',
      employee: payroll.employee,
      payPeriod: `${payroll.month}/${payroll.year}`,
      earnings: {
        basicSalary: payroll.basicSalary,
        hra: payroll.hra,
        da: payroll.da,
        bonus: payroll.bonus,
        totalEarnings: payroll.basicSalary + payroll.hra + payroll.da + payroll.bonus
      },
      deductions: payroll.deductions,
      netSalary: payroll.netSalary,
      generatedAt: new Date()
    };

    res.json({ success: true, data: payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
