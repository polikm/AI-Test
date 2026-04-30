const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await query(
      'SELECT id, username, phone, name, gender, birthday, school, grade, math_level, ai_level, award_level, avatar FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: '获取个人信息失败' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, gender, birthday, school, grade, math_level, ai_level, award_level } = req.body;

    const result = await query(
      `UPDATE users SET 
       name = COALESCE(?, name),
       gender = COALESCE(?, gender),
       birthday = COALESCE(?, birthday),
       school = COALESCE(?, school),
       grade = COALESCE(?, grade),
       math_level = COALESCE(?, math_level),
       ai_level = COALESCE(?, ai_level),
       award_level = COALESCE(?, award_level)
       WHERE id = ?`,
      [name, gender, birthday, school, grade, math_level, ai_level, award_level, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ message: '个人信息更新成功' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: '更新个人信息失败' });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM exam_records WHERE student_id = ? AND course_id = c.id) as exam_count
       FROM courses c 
       WHERE c.status = 'active'`,
      [userId]
    );
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: '获取课程列表失败' });
  }
});

router.get('/exam-history', async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await query(
      `SELECT er.*, c.name as course_name, c.category
       FROM exam_records er
       LEFT JOIN courses c ON er.course_id = c.id
       WHERE er.student_id = ?
       ORDER BY er.created_at DESC`,
      [userId]
    );
    res.json(records);
  } catch (error) {
    console.error('Get exam history error:', error);
    res.status(500).json({ error: '获取测评历史失败' });
  }
});

router.get('/notices', async (req, res) => {
  try {
    const userId = req.user.id;
    const notices = await query(
      `SELECT an.*, c.name as course_name, nt.name as template_name
       FROM admission_notices an
       LEFT JOIN courses c ON an.course_id = c.id
       LEFT JOIN notice_templates nt ON an.template_id = nt.id
       WHERE an.student_id = ?
       ORDER BY an.created_at DESC`,
      [userId]
    );
    res.json(notices.map(n => ({
      ...n,
      content: n.content ? JSON.parse(n.content) : {}
    })));
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: '获取通知列表失败' });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: '获取通知列表失败' });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: '已标记为已读' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

module.exports = router;
