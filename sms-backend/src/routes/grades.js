const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Not ekleme (admin veya öğretmen)
router.post('/', authenticateToken, async (req, res) => {
  const { role } = req.user;
  if (role !== 'ADMIN' && role !== 'TEACHER') {
    return res.status(403).json({ error: 'Only admins or teachers can add grades' });
  }

  const { studentId, subject, grade } = req.body;

  if (!studentId || !subject || !grade) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newGrade = await prisma.grade.create({
      data: {
        studentId: parseInt(studentId),
        subject,
        grade
      }
    });
    res.status(201).json({ message: 'Grade recorded', grade: newGrade });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Notları listele (herkes erişebilir)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const grades = await prisma.grade.findMany({
      include: { student: true },
      orderBy: { recordedAt: 'desc' }
    });
    res.json({ grades });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
// ✅ Not güncelle (sadece admin)
router.put('/:id', authenticateToken, async (req, res) => {
  const { role } = req.user;
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can update grades' });
  }

  const { id } = req.params;
  const { subject, grade } = req.body;

  if (!subject || !grade) {
    return res.status(400).json({ error: 'Subject and grade are required' });
  }

  try {
    const updatedGrade = await prisma.grade.update({
      where: { id: parseInt(id) },
      data: {
        subject,
        grade
      }
    });
    res.json({ message: 'Grade updated', grade: updatedGrade });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Not sil (sadece admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { role } = req.user;
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can delete grades' });
  }

  const { id } = req.params;

  try {
    await prisma.grade.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
