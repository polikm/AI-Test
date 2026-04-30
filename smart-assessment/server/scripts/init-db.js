const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'smart_assessment';

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  await connection.query(`USE ${dbName}`);

  const tables = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
      name VARCHAR(100),
      gender ENUM('male', 'female', 'other'),
      birthday DATE,
      school VARCHAR(200),
      grade INT,
      math_level ENUM('excellent', 'good', 'average', 'poor'),
      ai_level ENUM('none', 'beginner', 'intermediate', 'advanced') DEFAULT 'none',
      award_level ENUM('none', 'school', 'district', 'city', 'province', 'national') DEFAULT 'none',
      avatar VARCHAR(500),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      category ENUM('aigc', 'programming') NOT NULL,
      description TEXT,
      grade_range VARCHAR(20),
      cover_image VARCHAR(500),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      grade INT NOT NULL,
      type ENUM('single', 'multiple', 'judge', 'blank', 'code') NOT NULL,
      content TEXT NOT NULL,
      options JSON,
      answer TEXT NOT NULL,
      analysis TEXT,
      difficulty INT DEFAULT 3,
      dimensions JSON,
      tags JSON,
      source VARCHAR(200),
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP NULL,
      reviewed_by INT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS exam_papers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      course_id INT NOT NULL,
      grade INT NOT NULL,
      total_questions INT DEFAULT 15,
      time_limit INT DEFAULT 60,
      question_ids JSON NOT NULL,
      dimensions JSON,
      difficulty VARCHAR(20),
      status ENUM('draft', 'active', 'inactive') DEFAULT 'draft',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS exam_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      exam_paper_id INT NOT NULL,
      course_id INT NOT NULL,
      answers JSON,
      score DECIMAL(5,2),
      status ENUM('pending', 'in_progress', 'completed', 'graded') DEFAULT 'pending',
      started_at TIMESTAMP NULL,
      submitted_at TIMESTAMP NULL,
      graded_at TIMESTAMP NULL,
      ai_analysis TEXT,
      ability_level VARCHAR(10),
      dimension_scores JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (exam_paper_id) REFERENCES exam_papers(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS ability_levels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT,
      grade INT,
      level VARCHAR(10) NOT NULL,
      min_score INT NOT NULL,
      max_score INT NOT NULL,
      description TEXT,
      suggestions JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      course_id INT NOT NULL,
      teacher_id INT,
      grade VARCHAR(50),
      max_students INT DEFAULT 30,
      start_date DATE,
      status ENUM('open', 'closed', 'full') DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notice_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      type ENUM('admission', 'notice', 'reminder', 'result') NOT NULL,
      title VARCHAR(500),
      content TEXT NOT NULL,
      variables JSON,
      style JSON,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admission_notices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      course_id INT NOT NULL,
      class_id INT,
      exam_record_id INT,
      template_id INT NOT NULL,
      content JSON,
      status ENUM('draft', 'sent', 'viewed', 'accepted', 'rejected') DEFAULT 'draft',
      sent_at TIMESTAMP NULL,
      viewed_at TIMESTAMP NULL,
      response_at TIMESTAMP NULL,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (exam_record_id) REFERENCES exam_records(id),
      FOREIGN KEY (template_id) REFERENCES notice_templates(id)
    );

    CREATE TABLE IF NOT EXISTS exam_configs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      key_name VARCHAR(100) UNIQUE NOT NULL,
      value JSON NOT NULL,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT,
      data JSON,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;

  await connection.query(tables);
  console.log('All tables created successfully');

  await connection.query(`
    INSERT IGNORE INTO exam_configs (key_name, value, description) VALUES
    ('default_questions_count', '{"min": 15, "max": 30, "default": 15}', '默认测评题目数量配置'),
    ('question_types', '{"single": "单选题", "multiple": "多选题", "judge": "判断题", "blank": "填空题", "code": "编程题"}', '题目类型配置'),
    ('dimensions', '{"basic": "基础认知", "logic": "逻辑思维", "creative": "创意应用", "comprehensive": "综合素养"}', '考核维度配置')
  `);

  console.log('Default configs inserted');

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await connection.query(`
    INSERT IGNORE INTO users (username, password, phone, role, name, status) VALUES
    ('admin', '${hashedPassword}', '13800138000', 'admin', '系统管理员', 'active')
  `);
  console.log('Admin user created');

  await connection.query(`
    INSERT IGNORE INTO courses (name, code, category, description, grade_range, status) VALUES
    ('AIGC素养课', 'AIGC001', 'aigc', 'AI绘画、AI音视频等人工智能素养课程', '1-9', 'active'),
    ('Scratch编程', 'SCRATCH001', 'programming', 'Scratch图形化编程入门课程', '1-6', 'active'),
    ('Python编程', 'PYTHON001', 'programming', 'Python编程进阶课程', '4-9', 'active'),
    ('C++竞赛', 'CPP001', 'programming', 'C++信息学竞赛课程', '6-9', 'active')
  `);
  console.log('Default courses created');

  await connection.query(`
    INSERT IGNORE INTO ability_levels (course_id, grade, level, min_score, max_score, description, suggestions) VALUES
    (1, 0, 'A', 90, 100, '优秀', '{"class": "培优班", "suggestion": "建议直接进入培优班学习"}'),
    (1, 0, 'B', 75, 89, '良好', '{"class": "基础班", "suggestion": "建议进入基础班学习"}'),
    (1, 0, 'C', 60, 74, '一般', '{"class": "预备班", "suggestion": "建议进入预备班打牢基础"}'),
    (1, 0, 'D', 0, 59, '待提升', '{"class": "基础班", "suggestion": "建议先学习基础知识"}'),
    (2, 0, 'A', 90, 100, '优秀', '{"class": "Scratch培优班", "suggestion": "建议直接进入Scratch培优班"}'),
    (2, 0, 'B', 75, 89, '良好', '{"class": "Scratch基础班", "suggestion": "建议进入Scratch基础班"}'),
    (2, 0, 'C', 60, 74, '一般', '{"class": "Scratch入门班", "suggestion": "建议进入入门班"}'),
    (2, 0, 'D', 0, 59, '待提升', '{"class": "Scratch体验班", "suggestion": "建议先体验课程"}'),
    (3, 0, 'A', 90, 100, '优秀', '{"class": "Python竞赛班", "suggestion": "建议直接进入Python竞赛班"}'),
    (3, 0, 'B', 75, 89, '良好', '{"class": "Python提升班", "suggestion": "建议进入Python提升班"}'),
    (3, 0, 'C', 60, 74, '一般', '{"class": "Python基础班", "suggestion": "建议进入Python基础班"}'),
    (3, 0, 'D', 0, 59, '待提升', '{"class": "Python入门班", "suggestion": "建议先学习入门知识"}'),
    (4, 0, 'A', 90, 100, '优秀', '{"class": "C++竞赛班", "suggestion": "建议直接进入C++竞赛班"}'),
    (4, 0, 'B', 75, 89, '良好', '{"class": "C++提升班", "suggestion": "建议进入C++提升班"}'),
    (4, 0, 'C', 60, 74, '一般', '{"class": "C++基础班", "suggestion": "建议进入C++基础班"}'),
    (4, 0, 'D', 0, 59, '待提升', '{"class": "C++入门班", "suggestion": "建议先学习C++入门知识"}')
  `);
  console.log('Default ability levels created');

  await connection.query(`
    INSERT IGNORE INTO notice_templates (name, type, title, content, variables, status) VALUES
    ('默认录取通知书', 'admission', '🎉 恭喜！您已被{机构名称}{课程名称}录取', 
     '<div style=\"padding: 30px; border: 2px solid #1890ff; border-radius: 10px;\">\n<h2 style=\"text-align: center; color: #1890ff;\">✉️ 录取通知书</h2>\n<p>亲爱的<strong>{学生姓名}</strong>同学：</p>\n<p>恭喜您！经测评，您的<strong>{课程名称}</strong>能力评估为<strong>{能力等级}</strong>，特此录取。</p>\n<ul>\n<li>📚 推荐班级：{推荐班级}</li>\n<li>📅 开课时间：{开课时间}</li>\n<li>📍 上课地点：{上课地点}</li>\n<li>💰 课程费用：{课程费用}</li>\n</ul>\n<p>请家长于<strong>{报名截止日期}</strong>前完成报名缴费。</p>\n<p style=\"text-align: right;\">{机构名称}<br/>{通知书日期}</p>\n</div>',
     '["机构名称", "学生姓名", "课程名称", "能力等级", "推荐班级", "开课时间", "上课地点", "课程费用", "报名截止日期"]',
     'active'),
    ('测评结果通知', 'result', '📊 {课程名称}测评结果已出',
     '<div style=\"padding: 20px;\">\n<h3>亲爱的{学生姓名}家长：</h3>\n<p>您的孩子已完成{课程名称}入学测评。</p>\n<p><strong>测评结果：</strong>{能力等级}（{分数}分）</p>\n<p><strong>建议：</strong>{学习建议}</p>\n<p><a href=\"{报告链接}\">点击查看详细报告</a></p>\n</div>',
     '["学生姓名", "课程名称", "能力等级", "分数", "学习建议", "报告链接"]',
     'active')
  `);
  console.log('Default notice templates created');

  await connection.end();
  console.log('Database initialization completed!');
};

initDatabase().catch(console.error);
