# 智能测评系统

面向素质教育机构的智能入学测评系统，支持1-9年级学生的AIGC素养课和编程课入学测评。

## 功能特性

- 🎓 **智能组卷**：根据学生年级、能力基础自动生成测评试卷
- 📊 **个性化报告**：多维度分析、可视化图表、个性化学习建议
- 👨‍🎓 **学生端**：信息填写、在线测评、查看报告、接收通知
- 👨‍🏫 **教师端**：学生管理、测评管理、发送录取通知
- ⚙️ **管理端**：用户管理、题库管理、系统配置
- 🤖 **AI辅助**：AI出题建议、智能分析

## 技术栈

- **前端**：React 18 + Ant Design 5 + ECharts
- **后端**：Node.js + Express
- **数据库**：MySQL 8.0
- **AI集成**：OpenAI API（可选）

## 快速开始

### 1. 环境要求

- Node.js >= 16
- MySQL 8.0
- npm 或 yarn

### 2. 数据库配置

```bash
cd server
cp .env.example .env
# 编辑 .env 配置数据库连接
```

### 3. 安装依赖

```bash
# 后端
cd server
npm install

# 前端
cd ../client
npm install
```

### 4. 初始化数据库

```bash
cd server
npm run init-db
npm run seed
```

### 5. 启动服务

```bash
# 后端（端口 3001）
cd server
npm run dev

# 前端（端口 3000）
cd client
npm run dev
```

### 6. 访问系统

打开浏览器访问 http://localhost:3000

默认管理员账号：
- 用户名：admin
- 密码：admin123

## 项目结构

```
smart-assessment/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── layouts/       # 布局组件
│   │   └── services/      # API服务
│   └── package.json
│
├── server/                 # 后端项目
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── middleware/     # 中间件
│   │   └── config/         # 配置文件
│   ├── scripts/           # 初始化脚本
│   └── package.json
│
├── database/              # 数据库脚本
└── README.md
```

## API文档

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login-by-code` - 手机验证码登录

### 课程
- `GET /api/courses` - 获取课程列表
- `GET /api/courses/:id` - 获取课程详情

### 题库
- `GET /api/questions` - 获取题库列表
- `POST /api/questions` - 添加题目
- `PUT /api/questions/:id` - 更新题目
- `DELETE /api/questions/:id` - 删除题目
- `POST /api/questions/ai-generate` - AI生成题目

### 测评
- `POST /api/exams/generate-paper` - 生成试卷
- `POST /api/exams/start` - 开始测评
- `PUT /api/exams/:id/submit` - 提交测评

### 报告
- `GET /api/reports/personal/:recordId` - 个人报告
- `GET /api/reports/export/:recordId` - 导出PDF
- `GET /api/reports/class/:courseId` - 班级报表

### 通知
- `GET /api/notices/templates` - 获取模板列表
- `POST /api/notices/send-admission` - 发送录取通知

## 能力等级

| 等级 | 分数区间 | 建议班级 |
|------|----------|----------|
| A级 | 90-100 | 培优班 |
| B级 | 75-89 | 基础班 |
| C级 | 60-74 | 预备班 |
| D级 | 0-59 | 基础班 |

## License

MIT
