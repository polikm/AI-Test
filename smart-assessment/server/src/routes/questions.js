const express = require('express');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { course_id, grade, type, difficulty, status, page = 1, pageSize = 20 } = req.query;
    
    let sql = `
      SELECT q.*, c.name as course_name 
      FROM questions q 
      LEFT JOIN courses c ON q.course_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (course_id) {
      sql += ' AND q.course_id = ?';
      params.push(course_id);
    }
    if (grade) {
      sql += ' AND q.grade = ?';
      params.push(grade);
    }
    if (type) {
      sql += ' AND q.type = ?';
      params.push(type);
    }
    if (difficulty) {
      sql += ' AND q.difficulty = ?';
      params.push(difficulty);
    }
    if (status) {
      sql += ' AND q.status = ?';
      params.push(status);
    }

    const countResult = await query(
      sql.replace('SELECT q.*, c.name as course_name', 'SELECT COUNT(*) as total'),
      params
    );
    const total = countResult[0].total;

    sql += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    const questions = await query(sql, params);
    
    res.json({
      list: questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
        dimensions: q.dimensions ? JSON.parse(q.dimensions) : [],
        tags: q.tags ? JSON.parse(q.tags) : []
      })),
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: '获取题库列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await query(
      'SELECT q.*, c.name as course_name FROM questions q LEFT JOIN courses c ON q.course_id = c.id WHERE q.id = ?',
      [id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ error: '题目不存在' });
    }

    const q = questions[0];
    res.json({
      ...q,
      options: q.options ? JSON.parse(q.options) : [],
      dimensions: q.dimensions ? JSON.parse(q.dimensions) : [],
      tags: q.tags ? JSON.parse(q.tags) : []
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: '获取题目信息失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { course_id, grade, type, content, options, answer, analysis, difficulty, dimensions, tags, source } = req.body;
    
    if (!course_id || !grade || !type || !content || !answer) {
      return res.status(400).json({ error: '请填写完整的题目信息' });
    }

    const result = await query(
      `INSERT INTO questions (course_id, grade, type, content, options, answer, analysis, difficulty, dimensions, tags, source, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [
        course_id, 
        grade, 
        type, 
        content, 
        JSON.stringify(options || []), 
        answer, 
        analysis, 
        difficulty || 3, 
        JSON.stringify(dimensions || ['basic']), 
        JSON.stringify(tags || []), 
        source
      ]
    );

    res.json({ 
      id: result.insertId, 
      message: '题目创建成功' 
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: '创建题目失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, options, answer, analysis, difficulty, dimensions, tags, status } = req.body;

    const updates = [];
    const params = [];

    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }
    if (options !== undefined) {
      updates.push('options = ?');
      params.push(JSON.stringify(options));
    }
    if (answer !== undefined) {
      updates.push('answer = ?');
      params.push(answer);
    }
    if (analysis !== undefined) {
      updates.push('analysis = ?');
      params.push(analysis);
    }
    if (difficulty !== undefined) {
      updates.push('difficulty = ?');
      params.push(difficulty);
    }
    if (dimensions !== undefined) {
      updates.push('dimensions = ?');
      params.push(JSON.stringify(dimensions));
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(tags));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    params.push(id);
    const result = await query(`UPDATE questions SET ${updates.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '题目不存在' });
    }

    res.json({ message: '题目更新成功' });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: '更新题目失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM questions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '题目不存在' });
    }

    res.json({ message: '题目删除成功' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: '删除题目失败' });
  }
});

router.post('/review/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewer_id } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '无效的审核状态' });
    }

    const result = await query(
      'UPDATE questions SET status = ?, reviewed_at = NOW(), reviewed_by = ? WHERE id = ?',
      [status, reviewer_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '题目不存在' });
    }

    res.json({ message: '题目审核成功' });
  } catch (error) {
    console.error('Review question error:', error);
    res.status(500).json({ error: '审核题目失败' });
  }
});

router.post('/ai-generate', async (req, res) => {
  try {
    const { course_id, grade, type, count = 3 } = req.body;
    
    const mockQuestions = [];
    const questionTypes = {
      single: ['单选题'],
      judge: ['判断题'],
      multiple: ['多选题'],
      blank: ['填空题']
    };

    const mockContents = {
      aigc: {
        1: ['AI助手可以帮我们做什么？', '以下哪个是人工智能的应用？', '机器人会思考吗？'],
        4: ['下列哪个不是机器学习的应用？', '深度学习是机器学习的一个分支，对吗？'],
        7: ['Transformer架构主要用于什么任务？', '自然语言处理的主要挑战包括？']
      },
      programming: {
        1: ['Scratch中的角色叫什么？', '下列哪个是编程语言？', '代码是用来做什么的？'],
        4: ['Python中print函数的作用是？', '下列哪个是合法的变量名？'],
        7: ['C++中int类型占用几个字节？', '什么是面向对象编程？']
      }
    };

    for (let i = 0; i < count; i++) {
      const course = await query('SELECT code FROM courses WHERE id = ?', [course_id]);
      const category = course[0]?.code?.startsWith('AIGC') ? 'aigc' : 'programming';
      const contents = mockContents[category]?.[grade] || mockContents.aigc[1];
      
      mockQuestions.push({
        course_id,
        grade,
        type: type || 'single',
        content: contents[i % contents.length],
        options: type === 'single' ? [
          { key: 'A', value: '选项A' },
          { key: 'B', value: '选项B' },
          { key: 'C', value: '选项C' },
          { key: 'D', value: '选项D' }
        ] : [],
        answer: 'A',
        analysis: '这是一道AI生成的示例题目，建议人工审核后使用。',
        difficulty: 3,
        dimensions: ['basic']
      });
    }

    res.json({
      questions: mockQuestions,
      message: 'AI生成了' + count + '道题目，请审核后使用'
    });
  } catch (error) {
    console.error('AI generate questions error:', error);
    res.status(500).json({ error: 'AI生成题目失败' });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: '请提供题目数组' });
    }

    const values = questions.map(q => [
      q.course_id,
      q.grade,
      q.type,
      q.content,
      JSON.stringify(q.options || []),
      q.answer,
      q.analysis || '',
      q.difficulty || 3,
      JSON.stringify(q.dimensions || ['basic']),
      JSON.stringify(q.tags || []),
      q.source || 'batch_import',
      'approved'
    ]);

    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    
    const result = await query(
      `INSERT INTO questions (course_id, grade, type, content, options, answer, analysis, difficulty, dimensions, tags, source, status) VALUES ${placeholders}`,
      values.flat()
    );

    res.json({ 
      inserted: result.affectedRows,
      message: '批量导入成功' 
    });
  } catch (error) {
    console.error('Batch import error:', error);
    res.status(500).json({ error: '批量导入失败' });
  }
});

module.exports = router;
