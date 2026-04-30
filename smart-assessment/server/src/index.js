const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const questionRoutes = require('./routes/questions');
const examRoutes = require('./routes/exams');
const reportRoutes = require('./routes/reports');
const noticeRoutes = require('./routes/notices');
const configRoutes = require('./routes/configs');
const adminRoutes = require('./routes/admin');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/courses', courseRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/configs', configRoutes);

app.use('/api/student', authenticateToken(['student']), require('./routes/student'));
app.use('/api/teacher', authenticateToken(['teacher', 'admin']), require('./routes/teacher'));
app.use('/api/admin', authenticateToken(['admin']), adminRoutes);
app.use('/api/users', authenticateToken(['admin']), userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
