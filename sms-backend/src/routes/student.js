const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Kendi notlarını görme (student)
router.get('/my-grades', authenticateToken, async (req, res) => {
  const { role, id } = req.user;

  if (role !== 'STUDENT') {
    return res.status(403).json({ error: 'Only students can access this route' });
  }

  try {
    // User tablosundaki id → Student tablosundaki kayıtla eşleşmeli
    const student = await prisma.student.findFirst({
      where: { studentId: String(id) } // gerekirse username ile eşleştirilebilir
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const grades = await prisma.grade.findMany({
      where: { studentId: student.id },
      orderBy: { recordedAt: 'desc' }
    });

    res.json({ grades });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Kendi yoklamalarını görme (student)
router.get('/my-attendance', authenticateToken, async (req, res) => {
  const { role, id } = req.user;

  if (role !== 'STUDENT') {
    return res.status(403).json({ error: 'Only students can access this route' });
  }

  try {
    const student = await prisma.student.findFirst({
      where: { studentId: String(id) }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = await prisma.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' }
    });

    res.json({ attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
