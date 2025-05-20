const express = require('express');
const cors = require('cors');
const studentRoutes = require('./src/routes/students');
const attendanceRoutes = require('./src/routes/attendance');
const gradeRoutes = require('./src/routes/grades');
const studentSelfRoutes = require('./src/routes/student');
const parentRoutes = require('./src/routes/parent');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


const authRoutes = require('./src/routes/auth');
app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api', studentSelfRoutes);
app.use('/api', parentRoutes);
app.get('/', (req, res) => {
  res.send('SMS Backend çalışıyor ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});
