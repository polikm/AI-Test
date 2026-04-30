const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, grade, status = 'active' } = req.query;
    
    let sql = 'SELECT * FROM courses WHERE status = ?';
    const params = [status];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (grade) {
      sql += ' AND grade_range LIKE ?';
      params.push(`%${grade}%`);
    }

    sql += ' ORDER BY category, id';
    
    const courses = await query(sql, params);
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: '获取课程列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const courses = await query('SELECT * FROM courses WHERE id = ?', [id]);
    
    if (courses.length === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const questionCount = await query(
      'SELECT COUNT(*) as count FROM questions WHERE course_id = ? AND status = "approved"',
      [id]
    );

    res.json({
      ...courses[0],
      questionCount: questionCount[0].count
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: '获取课程信息失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, code, category, description, grade_range } = req.body;
    
    if (!name || !code || !category) {
      return res.status(400).json({ error: '请填写完整的课程信息' });
    }

    const result = await query(
      'INSERT INTO courses (name, code, category, description, grade_range) VALUES (?, ?, ?, ?, ?)',
      [name, code, category, description, grade_range]
    );

    res.json({ 
      id: result.insertId, 
      message: '课程创建成功' 
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: '创建课程失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, grade_range, status } = req.body;

    const result = await query(
      'UPDATE courses SET name = COALESCE(?, name), description = COALESCE(?, description), grade_range = COALESCE(?, grade_range), status = COALESCE(?, status) WHERE id = ?',
      [name, description, grade_range, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    res.json({ message: '课程更新成功' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: '更新课程失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM courses WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    res.json({ message: '课程删除成功' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: '删除课程失败' });
  }
});

module.exports = router;
