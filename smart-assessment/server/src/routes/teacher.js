const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

router.get('/students', async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { keyword, course_id, status } = req.query;

    let sql = `
      SELECT u.*, er.score as latest_score, er.ability_level, er.exam_count,
             c.name as course_name
      FROM users u
      LEFT JOIN (
        SELECT student_id, course_id, score, ability_level, COUNT(*) as exam_count
        FROM exam_records
        WHERE status = 'graded'
        GROUP BY student_id, course_id
      ) er ON u.id = er.student_id
      LEFT JOIN courses c ON er.course_id = c.id
      WHERE u.role = 'student'
    `;
    const params = [];

    if (keyword) {
      sql += ' AND (u.name LIKE ? OR u.username LIKE ? OR u.phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (course_id) {
      sql += ' AND er.course_id = ?';
      params.push(course_id);
    }

    sql += ' ORDER BY u.created_at DESC';

    const students = await query(sql, params);
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: '获取学生列表失败' });
  }
});

router.get('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await query(
      'SELECT * FROM users WHERE id = ? AND role = "student"',
      [id]
    );

    if (student.length === 0) {
      return res.status(404).json({ error: '学生不存在' });
    }

    const examRecords = await query(
      `SELECT er.*, c.name as course_name
       FROM exam_records er
       LEFT JOIN courses c ON er.course_id = c.id
       WHERE er.student_id = ?
       ORDER BY er.created_at DESC`,
      [id]
    );

    res.json({
      ...student[0],
      exam_records: examRecords
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: '获取学生信息失败' });
  }
});

router.get('/exam-overview', async (req, res) => {
  try {
    const { course_id, grade } = req.query;

    let sql = `
      SELECT er.*, u.name, u.school, u.grade as student_grade,
             c.name as course_name
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
      params.push(grade);
    }

    sql += ' ORDER BY er.score DESC';

    const records = await query(sql, params);

    const stats = {
      total: records.length,
      average_score: 0,
      distribution: { A: 0, B: 0, C: 0, D: 0 }
    };

    if (records.length > 0) {
      const totalScore = records.reduce((sum, r) => sum + (r.score || 0), 0);
      stats.average_score = Math.round(totalScore / records.length);
      records.forEach(r => {
        if (r.ability_level) {
          stats.distribution[r.ability_level]++;
        }
      });
    }

    res.json({ records, stats });
  } catch (error) {
    console.error('Get exam overview error:', error);
    res.status(500).json({ error: '获取测评概览失败' });
  }
});

router.get('/classes', async (req, res) => {
  try {
    const teacherId = req.user.id;
    const classes = await query(
      `SELECT cl.*, c.name as course_name, 
              (SELECT COUNT(*) FROM users WHERE class_id = cl.id) as student_count
       FROM classes cl
       LEFT JOIN courses c ON cl.course_id = c.id
       WHERE cl.teacher_id = ? OR ? = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
       ORDER BY cl.created_at DESC`,
      [teacherId, teacherId]
    );
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: '获取班级列表失败' });
  }
});

router.get('/reports/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { course_id } = req.query;

    let sql = `
      SELECT er.*, u.name, u.gender, u.birthday, u.school, u.grade as student_grade,
             c.name as course_name
      FROM exam_records er
      LEFT JOIN users u ON er.student_id = u.id
      LEFT JOIN courses c ON er.course_id = c.id
      WHERE er.student_id = ?
    `;
    const params = [studentId];

    if (course_id) {
      sql += ' AND er.course_id = ?';
      params.push(course_id);
    }

    sql += ' ORDER BY er.created_at DESC';

    const records = await query(sql, params);
    res.json(records);
  } catch (error) {
    console.error('Get student reports error:', error);
    res.status(500).json({ error: '获取学生报告失败' });
  }
});

router.post('/students/batch-import', async (req, res) => {
  try {
    const { students } = req.body;
    const teacherId = req.user.id;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: '请提供学生数组' });
    }

    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('123456', 10);
    
    const values = students.map(s => [
      s.username || `student_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      defaultPassword,
      s.phone || null,
      'student',
      s.name || s.username,
      s.gender || null,
      s.birthday || null,
      s.school || null,
      s.grade || null,
      s.math_level || 'average',
      s.ai_level || 'none',
      s.award_level || 'none',
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
      message: `成功导入 ${result.affectedRows} 个学生` 
    });
  } catch (error) {
    console.error('Batch import students error:', error);
    res.status(500).json({ error: '批量导入学生失败' });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const courses = await query(
      'SELECT * FROM courses WHERE status = "active" ORDER BY category, id'
    );
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: '获取课程列表失败' });
  }
});

module.exports = router;
