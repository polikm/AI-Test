const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      total_students: 0,
      total_teachers: 0,
      total_exams: 0,
      total_courses: 0,
      recent_exams: [],
      exam_trend: []
    };

    const studentCount = await query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    stats.total_students = studentCount[0].count;

    const teacherCount = await query('SELECT COUNT(*) as count FROM users WHERE role = "teacher"');
    stats.total_teachers = teacherCount[0].count;

    const examCount = await query('SELECT COUNT(*) as count FROM exam_records WHERE status = "graded"');
    stats.total_exams = examCount[0].count;

    const courseCount = await query('SELECT COUNT(*) as count FROM courses WHERE status = "active"');
    stats.total_courses = courseCount[0].count;

    stats.recent_exams = await query(
      `SELECT er.*, u.name as student_name, c.name as course_name
       FROM exam_records er
       LEFT JOIN users u ON er.student_id = u.id
       LEFT JOIN courses c ON er.course_id = c.id
       ORDER BY er.created_at DESC
       LIMIT 10`
    );

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    stats.exam_trend = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM exam_records
       WHERE created_at >= ?
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [sevenDaysAgo]
    );

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: '获取仪表盘数据失败' });
  }
});

router.get('/questions/stats', async (req, res) => {
  try {
    const { course_id } = req.query;

    let sql = `
      SELECT q.course_id, q.status, q.difficulty, q.type, COUNT(*) as count
      FROM questions q
      WHERE 1=1
    `;
    const params = [];

    if (course_id) {
      sql += ' AND q.course_id = ?';
      params.push(course_id);
    }

    sql += ' GROUP BY q.course_id, q.status, q.difficulty, q.type';

    const stats = await query(sql, params);
    const total = await query(
      'SELECT COUNT(*) as count FROM questions' + (course_id ? ' WHERE course_id = ?' : ''),
      course_id ? [course_id] : []
    );

    res.json({
      total: total[0].count,
      breakdown: stats
    });
  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({ error: '获取题目统计失败' });
  }
});

router.get('/exam-analysis', async (req, res) => {
  try {
    const { course_id, grade, start_date, end_date } = req.query;

    let sql = `
      SELECT er.*, u.grade as student_grade, u.school,
             c.name as course_name,
             er.dimension_scores
      FROM exam_records er
      LEFT JOIN users u ON er.student_id = u.id
      LEFT JOIN courses c ON er.course_id = c.id
      WHERE er.status = 'graded'
    `;
    const params = [];

    if (course_id) {
      sql += ' AND er.course_id = ?';
      params.push(course_id);
    }
    if (grade) {
      sql += ' AND u.grade = ?';
      params.push(parseInt(grade));
    }
    if (start_date) {
      sql += ' AND er.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND er.created_at <= ?';
      params.push(end_date);
    }

    const records = await query(sql, params);

    const analysis = {
      total_records: records.length,
      average_score: 0,
      pass_rate: 0,
      distribution: { A: 0, B: 0, C: 0, D: 0 },
      dimension_scores: {
        basic: { total: 0, correct: 0 },
        logic: { total: 0, correct: 0 },
        creative: { total: 0, correct: 0 },
        comprehensive: { total: 0, correct: 0 }
      },
      grade_distribution: {},
      school_distribution: {}
    };

    if (records.length > 0) {
      let totalScore = 0;
      let passed = 0;

      records.forEach(r => {
        totalScore += r.score || 0;
        if ((r.score || 0) >= 60) passed++;

        if (r.ability_level) {
          analysis.distribution[r.ability_level]++;
        }

        if (r.student_grade) {
          analysis.grade_distribution[r.student_grade] = 
            (analysis.grade_distribution[r.student_grade] || 0) + 1;
        }

        if (r.school) {
          analysis.school_distribution[r.school] = 
            (analysis.school_distribution[r.school] || 0) + 1;
        }

        if (r.dimension_scores) {
          const dims = JSON.parse(r.dimension_scores);
          for (const [dim, scores] of Object.entries(dims)) {
            if (analysis.dimension_scores[dim]) {
              analysis.dimension_scores[dim].total += scores.total || 0;
              analysis.dimension_scores[dim].correct += scores.correct || 0;
            }
          }
        }
      });

      analysis.average_score = Math.round(totalScore / records.length);
      analysis.pass_rate = Math.round((passed / records.length) * 100);

      for (const dim of Object.keys(analysis.dimension_scores)) {
        if (analysis.dimension_scores[dim].total > 0) {
          analysis.dimension_scores[dim].percentage = Math.round(
            (analysis.dimension_scores[dim].correct / analysis.dimension_scores[dim].total) * 100
          );
        }
      }
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get exam analysis error:', error);
    res.status(500).json({ error: '获取测评分析失败' });
  }
});

router.get('/ability-levels', async (req, res) => {
  try {
    const { course_id } = req.query;

    let sql = `
      SELECT al.*, c.name as course_name
      FROM ability_levels al
      LEFT JOIN courses c ON al.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (course_id) {
      sql += ' AND al.course_id = ?';
      params.push(course_id);
    }

    sql += ' ORDER BY al.course_id, al.min_score DESC';

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
      [level, min_score, max_score, description, suggestions ? JSON.stringify(suggestions) : null, id]
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

router.delete('/ability-levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM ability_levels WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '能力等级配置不存在' });
    }

    res.json({ message: '能力等级配置删除成功' });
  } catch (error) {
    console.error('Delete ability level error:', error);
    res.status(500).json({ error: '删除能力等级配置失败' });
  }
});

module.exports = router;
