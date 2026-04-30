const express = require('express');
const { query, getConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/generate-paper', async (req, res) => {
  try {
    const { course_id, grade, student_level = 'beginner', total_questions = 15 } = req.body;

    if (!course_id || !grade) {
      return res.status(400).json({ error: '课程和年级不能为空' });
    }

    const questions = await query(
      `SELECT * FROM questions 
       WHERE course_id = ? AND grade <= ? AND status = 'approved'
       ORDER BY difficulty, RAND()
       LIMIT ?`,
      [course_id, grade, total_questions * 2]
    );

    if (questions.length < total_questions) {
      return res.status(400).json({ 
        error: '题库题目不足', 
        available: questions.length,
        required: total_questions 
      });
    }

    const dimensionDistribution = {
      basic: 0.4,
      logic: 0.3,
      creative: 0.2,
      comprehensive: 0.1
    };

    const selectedQuestions = [];
    const dimensions = {};

    for (const q of questions) {
      const qDimensions = q.dimensions ? JSON.parse(q.dimensions) : ['basic'];
      const primaryDimension = qDimensions[0];

      if (!dimensions[primaryDimension]) {
        dimensions[primaryDimension] = [];
      }
      dimensions[primaryDimension].push(q);
    }

    for (const [dim, ratio] of Object.entries(dimensionDistribution)) {
      const targetCount = Math.ceil(total_questions * ratio);
      const dimQuestions = dimensions[dim] || [];
      
      for (let i = 0; i < targetCount && selectedQuestions.length < total_questions; i++) {
        if (dimQuestions.length > 0) {
          const index = Math.floor(Math.random() * dimQuestions.length);
          const question = dimQuestions.splice(index, 1)[0];
          if (!selectedQuestions.find(q => q.id === question.id)) {
            selectedQuestions.push(question);
          }
        }
      }
    }

    while (selectedQuestions.length < total_questions && questions.length > 0) {
      const index = Math.floor(Math.random() * questions.length);
      const question = questions.splice(index, 1)[0];
      if (!selectedQuestions.find(q => q.id === question.id)) {
        selectedQuestions.push(question);
      }
    }

    const paperId = uuidv4();
    const paperQuestions = selectedQuestions.map((q, index) => ({
      index: index + 1,
      id: q.id,
      type: q.type,
      content: q.content,
      options: q.options ? JSON.parse(q.options) : [],
      analysis: q.analysis,
      dimensions: q.dimensions ? JSON.parse(q.dimensions) : []
    }));

    await query(
      `INSERT INTO exam_papers (name, course_id, grade, total_questions, question_ids, dimensions, difficulty, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        `测评卷_${Date.now()}`,
        course_id, 
        grade, 
        paperQuestions.length,
        JSON.stringify(paperQuestions.map(q => q.id)),
        JSON.stringify(dimensionDistribution),
        student_level
      ]
    );

    res.json({
      paper_id: paperId,
      questions: paperQuestions,
      total: paperQuestions.length,
      time_limit: 60,
      course_id,
      grade
    });
  } catch (error) {
    console.error('Generate paper error:', error);
    res.status(500).json({ error: '生成试卷失败' });
  }
});

router.post('/start', async (req, res) => {
  try {
    const { student_id, exam_paper_id, course_id, answers = {} } = req.body;

    if (!student_id || !course_id) {
      return res.status(400).json({ error: '学生ID和课程ID不能为空' });
    }

    const recordId = uuidv4();
    await query(
      `INSERT INTO exam_records (id, student_id, exam_paper_id, course_id, answers, status, started_at) 
       VALUES (?, ?, ?, ?, ?, 'in_progress', NOW())`,
      [recordId, student_id, exam_paper_id || 0, course_id, JSON.stringify(answers)]
    );

    res.json({
      record_id: recordId,
      message: '测评已开始'
    });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ error: '开始测评失败' });
  }
});

router.put('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const records = await query('SELECT * FROM exam_records WHERE id = ?', [id]);
    if (records.length === 0) {
      return res.status(404).json({ error: '测评记录不存在' });
    }

    const record = records[0];
    const questions = record.exam_paper_id 
      ? await query('SELECT question_ids FROM exam_papers WHERE id = ?', [record.exam_paper_id])
      : [];

    let score = 0;
    let dimensionScores = {
      basic: { total: 0, correct: 0 },
      logic: { total: 0, correct: 0 },
      creative: { total: 0, correct: 0 },
      comprehensive: { total: 0, correct: 0 }
    };

    if (questions.length > 0 && questions[0].question_ids) {
      const questionIds = JSON.parse(questions[0].question_ids);
      const questionDetails = await query(
        `SELECT id, answer, dimensions FROM questions WHERE id IN (${questionIds.map(() => '?').join(',')})`,
        questionIds
      );

      const questionMap = {};
      questionDetails.forEach(q => {
        questionMap[q.id] = q;
      });

      for (const [qId, userAnswer] of Object.entries(answers)) {
        const question = questionMap[qId];
        if (question) {
          const correct = question.answer.toUpperCase().trim() === userAnswer.toString().toUpperCase().trim();
          if (correct) {
            score += 100 / questionIds.length;
          }

          const dims = question.dimensions ? JSON.parse(question.dimensions) : ['basic'];
          dims.forEach(dim => {
            if (dimensionScores[dim]) {
              dimensionScores[dim].total++;
              if (correct) dimensionScores[dim].correct++;
            }
          });
        }
      }
    }

    const abilityLevel = getAbilityLevel(score, record.course_id);

    await query(
      `UPDATE exam_records 
       SET answers = ?, score = ?, status = 'graded', submitted_at = NOW(), graded_at = NOW(),
           ability_level = ?, dimension_scores = ?
       WHERE id = ?`,
      [
        JSON.stringify(answers),
        Math.round(score * 100) / 100,
        abilityLevel.level,
        JSON.stringify(dimensionScores),
        id
      ]
    );

    res.json({
      score: Math.round(score * 100) / 100,
      ability_level: abilityLevel.level,
      dimension_scores: dimensionScores,
      suggestions: abilityLevel.suggestions
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ error: '提交测评失败' });
  }
});

function getAbilityLevel(score, courseId) {
  const levels = [
    { level: 'A', min: 90, max: 100, class: '培优班', suggestion: '建议直接进入培优班学习' },
    { level: 'B', min: 75, max: 89, class: '基础班', suggestion: '建议进入基础班学习' },
    { level: 'C', min: 60, max: 74, class: '预备班', suggestion: '建议进入预备班打牢基础' },
    { level: 'D', min: 0, max: 59, class: '基础班', suggestion: '建议先学习基础知识' }
  ];

  const result = levels.find(l => score >= l.min && score <= l.max) || levels[3];
  return {
    level: result.level,
    class: result.class,
    suggestions: result.suggestion
  };
}

router.get('/records/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { course_id, status } = req.query;

    let sql = `
      SELECT er.*, c.name as course_name, u.name as student_name
      FROM exam_records er
      LEFT JOIN courses c ON er.course_id = c.id
      LEFT JOIN users u ON er.student_id = u.id
      WHERE er.student_id = ?
    `;
    const params = [studentId];

    if (course_id) {
      sql += ' AND er.course_id = ?';
      params.push(course_id);
    }
    if (status) {
      sql += ' AND er.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY er.created_at DESC';

    const records = await query(sql, params);
    res.json(records);
  } catch (error) {
    console.error('Get exam records error:', error);
    res.status(500).json({ error: '获取测评记录失败' });
  }
});

router.get('/paper/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const papers = await query('SELECT * FROM exam_papers WHERE id = ?', [id]);
    if (papers.length === 0) {
      return res.status(404).json({ error: '试卷不存在' });
    }

    const paper = papers[0];
    const questionIds = JSON.parse(paper.question_ids);
    
    const questions = await query(
      `SELECT id, type, content, options, analysis, dimensions FROM questions WHERE id IN (${questionIds.map(() => '?').join(',')})`,
      questionIds
    );

    const questionMap = {};
    questions.forEach(q => {
      questionMap[q.id] = {
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
        dimensions: q.dimensions ? JSON.parse(q.dimensions) : []
      };
    });

    const orderedQuestions = questionIds.map((qId, index) => ({
      index: index + 1,
      ...questionMap[qId]
    }));

    res.json({
      ...paper,
      questions: orderedQuestions
    });
  } catch (error) {
    console.error('Get paper error:', error);
    res.status(500).json({ error: '获取试卷失败' });
  }
});

router.get('/class-report/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const classInfo = await query('SELECT * FROM classes WHERE id = ?', [classId]);
    if (classInfo.length === 0) {
      return res.status(404).json({ error: '班级不存在' });
    }

    const students = await query(
      `SELECT u.*, er.score, er.ability_level, er.dimension_scores
       FROM users u
       LEFT JOIN exam_records er ON u.id = er.student_id AND er.course_id = ?
       WHERE u.class_id = ? AND u.role = 'student'`,
      [classInfo[0].course_id, classId]
    );

    const stats = {
      total: students.length,
      completed: students.filter(s => s.score !== null).length,
      average_score: 0,
      distribution: { A: 0, B: 0, C: 0, D: 0 },
      dimension_avg: { basic: 0, logic: 0, creative: 0, comprehensive: 0 }
    };

    let totalScore = 0;
    students.forEach(s => {
      if (s.score !== null) {
        totalScore += s.score;
        stats.distribution[s.ability_level]++;
        
        if (s.dimension_scores) {
          const dims = JSON.parse(s.dimension_scores);
          Object.keys(dims).forEach(dim => {
            if (dims[dim].total > 0) {
              stats.dimension_avg[dim] += (dims[dim].correct / dims[dim].total) * 100;
            }
          });
        }
      }
    });

    if (stats.completed > 0) {
      stats.average_score = Math.round(totalScore / stats.completed);
      Object.keys(stats.dimension_avg).forEach(dim => {
        stats.dimension_avg[dim] = Math.round(stats.dimension_avg[dim] / stats.completed);
      });
    }

    res.json({
      class: classInfo[0],
      students,
      stats
    });
  } catch (error) {
    console.error('Get class report error:', error);
    res.status(500).json({ error: '获取班级报表失败' });
  }
});

module.exports = router;
