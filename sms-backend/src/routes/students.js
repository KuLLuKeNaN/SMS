const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Öğrenci ekle (sadece ADMIN)
router.post('/', authenticateToken, async (req, res) => {
  const { role } = req.user;
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can add students' });
  }

  const { name, studentId, contact, parentInfo, gradeLevel, userId, parentId } = req.body;

  if (!name || !studentId || !contact || !parentInfo || !gradeLevel) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const student = await prisma.student.create({
      data: {
		name,
		studentId,
		contact,
		parentInfo,
		gradeLevel,
		userId 
			}
    });
    res.status(201).json({ message: 'Student added', student });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Student ID must be unique' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Öğrenci listesi (herkes görebilir)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
// 🔄 Öğrenci GÜNCELLE (sadece ADMIN)
router.put('/:id', authenticateToken, async (req, res) => {
  const { role } = req.user;
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can update students' });
  }

  const { id } = req.params;
  const { name, studentId, contact, parentInfo, gradeLevel, parentId } = req.body;

  try {
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        name,
        studentId,
        contact,
        parentInfo,
        gradeLevel,
        parentId: parentId ? parseInt(parentId) : null
      }
    });

    res.json({ message: 'Student updated', student: updatedStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ❌ Öğrenci SİL (sadece ADMIN)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { role } = req.user;
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can delete students' });
  }

  const { id } = req.params;

  try {
    await prisma.student.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
