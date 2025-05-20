const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Veli sadece kendi çocuğunun notlarını görebilir
router.get('/my-child/grades', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') {
    return res.status(403).json({ error: 'Only parents can access this route' });
  }

  const student = await prisma.student.findFirst({
    where: { parentId: req.user.id }
  });

  if (!student) return res.status(404).json({ error: 'Student not found for this parent' });

  const grades = await prisma.grade.findMany({
    where: { studentId: student.id },
    orderBy: { recordedAt: 'desc' }
  });

  res.json({ grades });
});

// ✅ Veli sadece kendi çocuğunun yoklamalarını görebilir
router.get('/my-child/attendance', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PARENT') {
    return res.status(403).json({ error: 'Only parents can access this route' });
  }

  const student = await prisma.student.findFirst({
    where: { parentId: req.user.id }
  });

  if (!student) return res.status(404).json({ error: 'Student not found for this parent' });

  const attendance = await prisma.attendance.findMany({
    where: { studentId: student.id },
    orderBy: { date: 'desc' }
  });

  res.json({ attendance });
});

module.exports = router;
