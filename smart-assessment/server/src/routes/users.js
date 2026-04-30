const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { role, status, keyword, page = 1, pageSize = 20 } = req.query;
    
    let sql = 'SELECT id, username, phone, role, name, gender, birthday, school, grade, avatar, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (keyword) {
      sql += ' AND (name LIKE ? OR username LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const countSql = sql.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    const users = await query(sql, params);
    
    res.json({
      list: users,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await query(
      'SELECT id, username, phone, role, name, gender, birthday, school, grade, avatar, status, math_level, ai_level, award_level, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, password, phone, role, name, gender, birthday, school, grade } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const existing = await query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (username, password, phone, role, name, gender, birthday, school, grade) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, phone, role || 'student', name, gender, birthday, school, grade]
    );

    res.json({ id: result.insertId, message: '用户创建成功' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: '创建用户失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, name, gender, birthday, school, grade, status, math_level, ai_level, award_level } = req.body;

    const result = await query(
      `UPDATE users SET 
       phone = COALESCE(?, phone),
       name = COALESCE(?, name),
       gender = COALESCE(?, gender),
       birthday = COALESCE(?, birthday),
       school = COALESCE(?, school),
       grade = COALESCE(?, grade),
       status = COALESCE(?, status),
       math_level = COALESCE(?, math_level),
       ai_level = COALESCE(?, ai_level),
       award_level = COALESCE(?, award_level)
       WHERE id = ?`,
      [phone, name, gender, birthday, school, grade, status, math_level, ai_level, award_level, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ message: '用户更新成功' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: '更新用户失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

router.post('/batch-import', async (req, res) => {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users)) {
      return res.status(400).json({ error: '请提供用户数组' });
    }

    const defaultPassword = await bcrypt.hash('123456', 10);
    const values = users.map(u => [
      u.username || `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      defaultPassword,
      u.phone || null,
      u.role || 'student',
      u.name || u.username,
      u.gender || null,
      u.birthday || null,
      u.school || null,
      u.grade || null,
      u.math_level || 'average',
      u.ai_level || 'none',
      u.award_level || 'none',
      'active'
    ]);

    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    
    const result = await query(
      `INSERT INTO users (username, password, phone, role, name, gender, birthday, school, grade, math_level, ai_level, award_level, status) 
       VALUES ${placeholders}`,
      values.flat()
    );

    res.json({ 
      inserted: result.affectedRows,
      message: `成功导入 ${result.affectedRows} 个用户` 
    });
  } catch (error) {
    console.error('Batch import error:', error);
    res.status(500).json({ error: '批量导入失败' });
  }
});

module.exports = router;
