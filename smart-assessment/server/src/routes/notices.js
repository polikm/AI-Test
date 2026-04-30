const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

router.get('/templates', async (req, res) => {
  try {
    const { type, status = 'active' } = req.query;
    
    let sql = 'SELECT * FROM notice_templates WHERE status = ?';
    const params = [status];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC';

    const templates = await query(sql, params);
    res.json(templates.map(t => ({
      ...t,
      variables: t.variables ? JSON.parse(t.variables) : [],
      style: t.style ? JSON.parse(t.style) : {}
    })));
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: '获取通知模板失败' });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const templates = await query('SELECT * FROM notice_templates WHERE id = ?', [id]);

    if (templates.length === 0) {
      return res.status(404).json({ error: '模板不存在' });
    }

    const t = templates[0];
    res.json({
      ...t,
      variables: t.variables ? JSON.parse(t.variables) : [],
      style: t.style ? JSON.parse(t.style) : {}
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: '获取模板信息失败' });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const { name, type, title, content, variables, style, created_by } = req.body;

    if (!name || !type || !content) {
      return res.status(400).json({ error: '请填写完整的模板信息' });
    }

    const result = await query(
      'INSERT INTO notice_templates (name, type, title, content, variables, style, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, type, title, content, JSON.stringify(variables || []), JSON.stringify(style || {}), created_by]
    );

    res.json({ id: result.insertId, message: '模板创建成功' });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: '创建模板失败' });
  }
});

router.put('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, content, variables, style, status } = req.body;

    const result = await query(
      `UPDATE notice_templates SET 
       name = COALESCE(?, name),
       title = COALESCE(?, title),
       content = COALESCE(?, content),
       variables = COALESCE(?, variables),
       style = COALESCE(?, style),
       status = COALESCE(?, status)
       WHERE id = ?`,
      [
        name, title, content,
        variables ? JSON.stringify(variables) : null,
        style ? JSON.stringify(style) : null,
        status, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '模板不存在' });
    }

    res.json({ message: '模板更新成功' });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: '更新模板失败' });
  }
});

router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM notice_templates WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '模板不存在' });
    }

    res.json({ message: '模板删除成功' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: '删除模板失败' });
  }
});

router.post('/send-admission', async (req, res) => {
  try {
    const { student_ids, template_id, course_id, class_id, extra_data = {} } = req.body;

    if (!student_ids || !template_id || !course_id) {
      return res.status(400).json({ error: '请提供学生ID、模板ID和课程ID' });
    }

    const templates = await query('SELECT * FROM notice_templates WHERE id = ?', [template_id]);
    if (templates.length === 0) {
      return res.status(404).json({ error: '模板不存在' });
    }

    const template = templates[0];
    const results = [];

    for (const student_id of student_ids) {
      const students = await query('SELECT * FROM users WHERE id = ?', [student_id]);
      if (students.length === 0) continue;

      const student = students[0];
      const examRecord = await query(
        'SELECT * FROM exam_records WHERE student_id = ? AND course_id = ? ORDER BY created_at DESC LIMIT 1',
        [student_id, course_id]
      );

      let content = template.content;
      content = content.replace(/\{学生姓名\}/g, student.name || student.username);
      content = content.replace(/\{机构名称\}/g, extra_data.org_name || '本机构');
      content = content.replace(/\{课程名称\}/g, extra_data.course_name || '');
      content = content.replace(/\{能力等级\}/g, examRecord[0]?.ability_level || '待评估');
      content = content.replace(/\{分数\}/g, examRecord[0]?.score || '待测评');
      content = content.replace(/\{推荐班级\}/g, extra_data.class_name || '基础班');
      content = content.replace(/\{开课时间\}/g, extra_data.start_date || '待定');
      content = content.replace(/\{上课地点\}/g, extra_data.location || '待定');
      content = content.replace(/\{课程费用\}/g, extra_data.fee || '待定');
      content = content.replace(/\{报名截止日期\}/g, extra_data.deadline || '待定');
      content = content.replace(/\{通知书日期\}/g, new Date().toLocaleDateString('zh-CN'));

      const result = await query(
        `INSERT INTO admission_notices 
         (student_id, course_id, class_id, exam_record_id, template_id, content, status, sent_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, 'sent', NOW(), ?)`,
        [
          student_id,
          course_id,
          class_id || null,
          examRecord[0]?.id || null,
          template_id,
          JSON.stringify({ html: content, variables: extra_data }),
          extra_data.created_by
        ]
      );

      await query(
        'INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)',
        [student_id, 'admission', template.title || '录取通知书', '您有一封新的录取通知书，请查收']
      );

      results.push({ student_id, notice_id: result.insertId });
    }

    res.json({
      message: `成功发送 ${results.length} 封录取通知书`,
      results
    });
  } catch (error) {
    console.error('Send admission error:', error);
    res.status(500).json({ error: '发送录取通知书失败' });
  }
});

router.get('/notices', async (req, res) => {
  try {
    const { user_id, type, status } = req.query;
    
    let sql = `
      SELECT an.*, u.name as student_name, c.name as course_name,
             nt.name as template_name
      FROM admission_notices an
      LEFT JOIN users u ON an.student_id = u.id
      LEFT JOIN courses c ON an.course_id = c.id
      LEFT JOIN notice_templates nt ON an.template_id = nt.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      sql += ' AND an.student_id = ?';
      params.push(user_id);
    }
    if (type) {
      sql += ' AND nt.type = ?';
      params.push(type);
    }
    if (status) {
      sql += ' AND an.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY an.created_at DESC';

    const notices = await query(sql, params);
    res.json(notices.map(n => ({
      ...n,
      content: n.content ? JSON.parse(n.content) : {}
    })));
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: '获取通知列表失败' });
  }
});

router.put('/notices/:id/response', async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ error: '无效的响应' });
    }

    const result = await query(
      'UPDATE admission_notices SET status = ?, response_at = NOW() WHERE id = ?',
      [response, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '通知不存在' });
    }

    res.json({ message: '响应已提交' });
  } catch (error) {
    console.error('Response notice error:', error);
    res.status(500).json({ error: '提交响应失败' });
  }
});

module.exports = router;
