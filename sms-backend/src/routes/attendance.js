const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ POST /api/attendance → Add record (Admin & Teacher)
router.post('/', authenticateToken, async (req, res) => {
  const { role } = req.user;

  if (role !== 'ADMIN' && role !== 'TEACHER') {
    return res.status(403).json({ error: 'Only admins or teachers can add attendance records' });
  }

  const { studentId, date, status } = req.body;

  if (!studentId || !date || !status) {
    return res.status(400).json({ error: 'All fields (studentId, date, status) are required' });
  }

  try {
    const attendance = await prisma.attendance.create({
      data: {
        studentId: parseInt(studentId),
        date: new Date(date),
        status
      }
    });
    res.status(201).json({ message: 'Attendance recorded', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/attendance → List all
router.get('/', authenticateToken, async (req, res) => {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      include: { student: true },
      orderBy: { date: 'desc' }
    });
    res.json({ attendance: attendanceRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
