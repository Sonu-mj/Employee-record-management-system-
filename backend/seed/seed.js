require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Announcement = require('../models/Announcement');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear all collections
    await User.deleteMany();
    await Department.deleteMany();
    await Leave.deleteMany();
    await Attendance.deleteMany();
    await Payroll.deleteMany();
    await Announcement.deleteMany();

    console.log('Collections cleared...');

    // Seed Departments
    const departments = await Department.insertMany([
      { name: 'Engineering', description: 'Software development and technical operations' },
      { name: 'Human Resources', description: 'Employee management and recruitment' },
      { name: 'Marketing', description: 'Brand promotion and customer outreach' },
      { name: 'Finance', description: 'Financial planning and accounting' },
      { name: 'Operations', description: 'Day-to-day business operations' }
    ]);

    console.log(`${departments.length} departments seeded`);

    // Seed Users (password for all: password123)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@erms.com',
      password: 'password123',
      role: 'admin',
      department: departments[1]._id,
      position: 'HR Manager',
      phone: '9876543210',
      joinDate: '2022-01-15'
    });

    const employees = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@erms.com',
        password: 'password123',
        role: 'employee',
        department: departments[0]._id,
        position: 'Senior Developer',
        phone: '9876543211',
        joinDate: '2022-03-01'
      },
      {
        name: 'Jane Smith',
        email: 'jane@erms.com',
        password: 'password123',
        role: 'employee',
        department: departments[0]._id,
        position: 'Frontend Developer',
        phone: '9876543212',
        joinDate: '2022-06-15'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@erms.com',
        password: 'password123',
        role: 'employee',
        department: departments[2]._id,
        position: 'Marketing Specialist',
        phone: '9876543213',
        joinDate: '2023-01-10'
      },
      {
        name: 'Alice Brown',
        email: 'alice@erms.com',
        password: 'password123',
        role: 'employee',
        department: departments[3]._id,
        position: 'Accountant',
        phone: '9876543214',
        joinDate: '2023-04-20'
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@erms.com',
        password: 'password123',
        role: 'employee',
        department: departments[4]._id,
        position: 'Operations Analyst',
        phone: '9876543215',
        joinDate: '2023-07-01'
      }
    ]);

    console.log(`${employees.length + 1} users seeded (1 admin + ${employees.length} employees)`);

    // Update department heads
    await Department.findByIdAndUpdate(departments[1]._id, { head: admin._id });
    await Department.findByIdAndUpdate(departments[0]._id, { head: employees[0]._id });

    // Seed Leaves
    const leaves = await Leave.insertMany([
      {
        employee: employees[0]._id,
        type: 'annual',
        startDate: '2024-01-20',
        endDate: '2024-01-25',
        reason: 'Family vacation',
        status: 'approved',
        reviewedBy: admin._id
      },
      {
        employee: employees[1]._id,
        type: 'sick',
        startDate: '2024-02-10',
        endDate: '2024-02-12',
        reason: 'Flu recovery',
        status: 'approved',
        reviewedBy: admin._id
      },
      {
        employee: employees[2]._id,
        type: 'casual',
        startDate: '2024-03-05',
        endDate: '2024-03-06',
        reason: 'Personal work',
        status: 'pending'
      },
      {
        employee: employees[3]._id,
        type: 'annual',
        startDate: '2024-04-01',
        endDate: '2024-04-05',
        reason: 'Travel plans',
        status: 'pending'
      }
    ]);

    console.log(`${leaves.length} leave requests seeded`);

    // Seed Attendance (last 7 days for all employees)
    const attendanceRecords = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      for (const emp of employees) {
        const checkInHour = 8 + Math.floor(Math.random() * 3); // 8-10 AM
        const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, Math.floor(Math.random() * 60), 0);
        const checkOut = new Date(date);
        checkOut.setHours(checkOutHour, Math.floor(Math.random() * 60), 0);

        attendanceRecords.push({
          employee: emp._id,
          date,
          checkIn,
          checkOut,
          status: checkInHour >= 10 ? 'late' : 'present'
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`${attendanceRecords.length} attendance records seeded`);

    // Seed Payroll
    const payrollRecords = await Payroll.insertMany([
      {
        employee: employees[0]._id, month: 1, year: 2024,
        basicSalary: 80000, hra: 20000, da: 10000, bonus: 5000, deductions: 5000
      },
      {
        employee: employees[1]._id, month: 1, year: 2024,
        basicSalary: 60000, hra: 15000, da: 8000, bonus: 3000, deductions: 4000
      },
      {
        employee: employees[2]._id, month: 1, year: 2024,
        basicSalary: 55000, hra: 12000, da: 7000, bonus: 2000, deductions: 3500
      },
      {
        employee: employees[3]._id, month: 1, year: 2024,
        basicSalary: 65000, hra: 16000, da: 9000, bonus: 4000, deductions: 4500
      },
      {
        employee: employees[4]._id, month: 1, year: 2024,
        basicSalary: 50000, hra: 10000, da: 6000, bonus: 2000, deductions: 3000
      }
    ]);

    console.log(`${payrollRecords.length} payroll records seeded`);

    // Seed Announcements
    const announcements = await Announcement.insertMany([
      {
        title: 'Welcome to ERMS',
        message: 'The Employee Record Management System is now live. Please explore all features and report any issues.',
        postedBy: admin._id,
        priority: 'high'
      },
      {
        title: 'Holiday Notice',
        message: 'Office will remain closed on 26th January for Republic Day. Enjoy the holiday!',
        postedBy: admin._id,
        priority: 'normal'
      },
      {
        title: 'Annual Health Checkup',
        message: 'Annual health checkup camp will be organized on 15th Feb. Registration is mandatory for all employees.',
        postedBy: admin._id,
        priority: 'urgent'
      }
    ]);

    console.log(`${announcements.length} announcements seeded`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('  Admin:    admin@erms.com / password123');
    console.log('  Employee: john@erms.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
