const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { username, password, role, email } = req.body;

    // Kontrol: Tüm alanlar dolu mu?
    if (!username || !password || !role || !email) {
      return res.status(400).json({ error: 'All fields must be filled' });
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Veritabanına kaydet
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        email,
      },
    });

    res.status(201).json({ message: 'Register successfull!', user: newUser });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Username or email is already registered' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Server error.' });
    }
  }
});
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
  message: 'Login successful!',
  token,
  user: {
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email
  }
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
const authenticateToken = require('../middleware/auth');

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, role: true, email: true }
    });

    res.json({ message: 'Profil bilgisi', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});
