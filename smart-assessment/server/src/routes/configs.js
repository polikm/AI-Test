const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const configs = await query('SELECT * FROM exam_configs ORDER BY key_name');
    res.json(configs.map(c => ({
      ...c,
      value: JSON.parse(c.value)
    })));
  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ error: '获取配置失败' });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const configs = await query('SELECT * FROM exam_configs WHERE key_name = ?', [key]);

    if (configs.length === 0) {
      return res.status(404).json({ error: '配置不存在' });
    }

    res.json({
      ...configs[0],
      value: JSON.parse(configs[0].value)
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: '获取配置失败' });
  }
});

router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const existing = await query('SELECT * FROM exam_configs WHERE key_name = ?', [key]);
    
    if (existing.length === 0) {
      await query(
        'INSERT INTO exam_configs (key_name, value, description) VALUES (?, ?, ?)',
        [key, JSON.stringify(value), description]
      );
    } else {
      await query(
        'UPDATE exam_configs SET value = ?, description = COALESCE(?, description) WHERE key_name = ?',
        [JSON.stringify(value), description, key]
      );
    }

    res.json({ message: '配置更新成功' });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: '更新配置失败' });
  }
});

router.get('/ability-levels/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { grade } = req.query;

    let sql = 'SELECT * FROM ability_levels WHERE course_id = ?';
    const params = [courseId];

    if (grade) {
      sql += ' AND (grade = ? OR grade = 0)';
      params.push(grade);
    }

    sql += ' ORDER BY min_score DESC';

    const levels = await query(sql, params);
    res.json(levels.map(l => ({
      ...l,
      suggestions: l.suggestions ? JSON.parse(l.suggestions) : {}
    })));
  } catch (error) {
    console.error('Get ability levels error:', error);
    res.status(500).json({ error: '获取能力等级配置失败' });
  }
});

router.post('/ability-levels', async (req, res) => {
  try {
    const { course_id, grade, level, min_score, max_score, description, suggestions } = req.body;

    const result = await query(
      'INSERT INTO ability_levels (course_id, grade, level, min_score, max_score, description, suggestions) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [course_id, grade || 0, level, min_score, max_score, description, JSON.stringify(suggestions || {})]
    );

    res.json({ id: result.insertId, message: '能力等级配置成功' });
  } catch (error) {
    console.error('Create ability level error:', error);
    res.status(500).json({ error: '创建能力等级配置失败' });
  }
});

router.put('/ability-levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { level, min_score, max_score, description, suggestions } = req.body;

    const result = await query(
      `UPDATE ability_levels SET 
       level = COALESCE(?, level),
       min_score = COALESCE(?, min_score),
       max_score = COALESCE(?, max_score),
       description = COALESCE(?, description),
       suggestions = COALESCE(?, suggestions)
       WHERE id = ?`,
      [
        level, min_score, max_score, description,
        suggestions ? JSON.stringify(suggestions) : null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '能力等级配置不存在' });
    }

    res.json({ message: '能力等级配置更新成功' });
  } catch (error) {
    console.error('Update ability level error:', error);
    res.status(500).json({ error: '更新能力等级配置失败' });
  }
});

module.exports = router;
