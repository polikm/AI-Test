-- Smart Assessment System Database Initialization
-- Version: 1.0.0

CREATE DATABASE IF NOT EXISTS smart_assessment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_assessment;

-- Users Table
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

-- Courses Table
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

-- Questions Table
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

-- Exam Papers Table
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

-- Exam Records Table
CREATE TABLE IF NOT EXISTS exam_records (
  id VARCHAR(36) PRIMARY KEY,
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

-- Ability Levels Table
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

-- Classes Table
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

-- Notice Templates Table
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

-- Admission Notices Table
CREATE TABLE IF NOT EXISTS admission_notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  class_id INT,
  exam_record_id VARCHAR(36),
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
  FOREIGN KEY (template_id) REFERENCES notice_templates(id)
);

-- Exam Configs Table
CREATE TABLE IF NOT EXISTS exam_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value JSON NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications Table
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

-- Create indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_questions_course ON questions(course_id);
CREATE INDEX idx_questions_grade ON questions(grade);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_exam_records_student ON exam_records(student_id);
CREATE INDEX idx_exam_records_course ON exam_records(course_id);
CREATE INDEX idx_exam_records_status ON exam_records(status);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, phone, role, name, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800000000', 'admin', '系统管理员', 'active');

-- Insert default courses
INSERT INTO courses (name, code, category, description, grade_range, status) VALUES
('AIGC素养课', 'AIGC001', 'aigc', '人工智能生成内容基础课程，学习AI工具使用和创意表达', '1-6年级', 'active'),
('编程思维课', 'PROG001', 'programming', '编程思维训练课程，培养逻辑思维和问题解决能力', '3-9年级', 'active');

-- Insert sample questions
INSERT INTO questions (course_id, grade, type, content, options, answer, analysis, difficulty, dimensions, status) VALUES
(1, 1, 'single', 'AI是什么的缩写？', '[{"key":"A","value":"Artificial Intelligence"},{"key":"B","value":"Advanced Internet"},{"key":"C","value":"Auto Input"},{"key":"D","value":"Application Interface"}]', 'A', 'AI是Artificial Intelligence的缩写，意为人工智能。', 1, '["basic"]', 'approved'),
(1, 2, 'single', '以下哪个是AI绘画工具？', '[{"key":"A","value":"Photoshop"},{"key":"B","value":"Midjourney"},{"key":"C","value":"Word"},{"key":"D","value":"Excel"}]', 'B', 'Midjourney是一款AI绘画工具，可以根据文字描述生成图像。', 2, '["basic"]', 'approved'),
(2, 3, 'single', '编程中，"循环"的作用是什么？', '[{"key":"A","value":"让程序停止运行"},{"key":"B","value":"重复执行某段代码"},{"key":"C","value":"删除代码"},{"key":"D","value":"加速程序运行"}]', 'B', '循环用于重复执行某段代码，直到满足特定条件为止。', 2, '["logic"]', 'approved'),
(2, 4, 'single', '以下哪个是编程语言？', '[{"key":"A","value":"HTML"},{"key":"B","value":"Python"},{"key":"C","value":"HTTP"},{"key":"D","value":"URL"}]', 'B', 'Python是一种编程语言，HTML是标记语言，HTTP是协议，URL是地址。', 1, '["basic"]', 'approved');
