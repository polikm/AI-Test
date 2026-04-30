const express = require('express');
const PDFDocument = require('pdfkit');
const { query } = require('../config/database');

const router = express.Router();

router.get('/personal/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const records = await query(
      `SELECT er.*, u.name, u.gender, u.birthday, u.school, u.grade as student_grade,
              c.name as course_name, c.category
       FROM exam_records er
       LEFT JOIN users u ON er.student_id = u.id
       LEFT JOIN courses c ON er.course_id = c.id
       WHERE er.id = ?`,
      [recordId]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: '测评记录不存在' });
    }

    const record = records[0];
    const abilityLevel = await query(
      `SELECT * FROM ability_levels 
       WHERE course_id = ? AND level = ?`,
      [record.course_id, record.ability_level]
    );

    const suggestions = abilityLevel.length > 0 && abilityLevel[0].suggestions 
      ? JSON.parse(abilityLevel[0].suggestions) 
      : {};

    res.json({
      personal_info: {
        name: record.name,
        gender: record.gender === 'male' ? '男' : record.gender === 'female' ? '女' : '未知',
        birthday: record.birthday,
        school: record.school,
        grade: record.student_grade
      },
      exam_info: {
        course_name: record.course_name,
        category: record.category,
        score: record.score,
        ability_level: record.ability_level,
        status: record.status,
        started_at: record.started_at,
        submitted_at: record.submitted_at
      },
      dimension_scores: record.dimension_scores ? JSON.parse(record.dimension_scores) : {},
      suggestions: {
        class: suggestions.class || '基础班',
        suggestion: suggestions.suggestion || '建议按部就班学习'
      },
      ability_description: abilityLevel.length > 0 ? abilityLevel[0].description : ''
    });
  } catch (error) {
    console.error('Get personal report error:', error);
    res.status(500).json({ error: '获取个人报告失败' });
  }
});

router.get('/export/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const records = await query(
      `SELECT er.*, u.name, u.gender, u.birthday, u.school, u.grade as student_grade,
              c.name as course_name
       FROM exam_records er
       LEFT JOIN users u ON er.student_id = u.id
       LEFT JOIN courses c ON er.course_id = c.id
       WHERE er.id = ?`,
      [recordId]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: '测评记录不存在' });
    }

    const record = records[0];
    const abilityLevel = await query(
      `SELECT * FROM ability_levels WHERE course_id = ? AND level = ?`,
      [record.course_id, record.ability_level]
    );

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report_${recordId}.pdf`);
    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').text('智能测评报告', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`姓名：${record.name || '未填写'}`);
    doc.text(`性别：${record.gender === 'male' ? '男' : record.gender === 'female' ? '女' : '未知'}`);
    doc.text(`学校：${record.school || '未填写'}`);
    doc.text(`年级：${record.student_grade || '未填写'}年级`);
    doc.moveDown();

    doc.fontSize(16).font('Helvetica-Bold').text('测评结果', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`课程：${record.course_name}`);
    doc.text(`得分：${record.score || 0} 分`);
    doc.text(`能力等级：${record.ability_level || '待评估'}`);
    
    if (abilityLevel.length > 0) {
      doc.text(`等级描述：${abilityLevel[0].description}`);
    }
    doc.moveDown();

    const dimensionScores = record.dimension_scores ? JSON.parse(record.dimension_scores) : {};
    if (Object.keys(dimensionScores).length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('各维度得分', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      
      const dimNames = {
        basic: '基础认知',
        logic: '逻辑思维',
        creative: '创意应用',
        comprehensive: '综合素养'
      };

      for (const [dim, scores] of Object.entries(dimensionScores)) {
        if (scores.total > 0) {
          const percentage = Math.round((scores.correct / scores.total) * 100);
          doc.text(`${dimNames[dim] || dim}：${percentage}% (${scores.correct}/${scores.total})`);
        }
      }
      doc.moveDown();
    }

    const suggestions = abilityLevel.length > 0 && abilityLevel[0].suggestions 
      ? JSON.parse(abilityLevel[0].suggestions) 
      : {};

    doc.fontSize(16).font('Helvetica-Bold').text('学习建议', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`推荐班级：${suggestions.class || '基础班'}`);
    doc.text(`建议：${suggestions.suggestion || '建议按部就班学习'}`);

    doc.moveDown(2);
    doc.fontSize(10).text(`报告生成时间：${new Date().toLocaleString('zh-CN')}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ error: '导出报告失败' });
  }
});

router.get('/class/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { grade, start_date, end_date } = req.query;

    let sql = `
      SELECT er.*, u.name, u.school, u.grade as student_grade,
             COUNT(er.id) as exam_count,
             AVG(er.score) as avg_score
      FROM exam_records er
      LEFT JOIN users u ON er.student_id = u.id
      WHERE er.course_id = ? AND er.status = 'graded'
    `;
    const params = [courseId];

    if (grade) {
      sql += ' AND u.grade = ?';
      params.push(grade);
    }

    sql += ' GROUP BY er.student_id ORDER BY avg_score DESC';

    const students = await query(sql, params);

    const stats = {
      total_students: students.length,
      avg_score: 0,
      pass_rate: 0,
      distribution: { A: 0, B: 0, C: 0, D: 0 },
      dimension_summary: { basic: 0, logic: 0, creative: 0, comprehensive: 0 }
    };

    if (students.length > 0) {
      const totalScore = students.reduce((sum, s) => sum + (s.avg_score || 0), 0);
      stats.avg_score = Math.round(totalScore / students.length);
      
      const passed = students.filter(s => (s.avg_score || 0) >= 60).length;
      stats.pass_rate = Math.round((passed / students.length) * 100);

      students.forEach(s => {
        if (s.ability_level) {
          stats.distribution[s.ability_level]++;
        }
      });

      for (const student of students) {
        if (student.dimension_scores) {
          const dims = JSON.parse(student.dimension_scores);
          for (const [dim, scores] of Object.entries(dims)) {
            if (scores.total > 0) {
              stats.dimension_summary[dim] += (scores.correct / scores.total) * 100;
            }
          }
        }
      }

      for (const dim of Object.keys(stats.dimension_summary)) {
        stats.dimension_summary[dim] = Math.round(stats.dimension_summary[dim] / students.length);
      }
    }

    res.json({
      students,
      stats
    });
  } catch (error) {
    console.error('Get class report error:', error);
    res.status(500).json({ error: '获取班级报表失败' });
  }
});

module.exports = router;
