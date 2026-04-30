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
- **容器化**：Docker + Docker Compose

## 快速开始

### 方式一：Docker 一键部署（推荐）

#### 1. 环境要求

- Docker >= 20.10
- Docker Compose >= 2.0

#### 2. 克隆项目

```bash
git clone https://github.com/your-username/smart-assessment.git
cd smart-assessment
```

#### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，修改以下配置：

```env
# 数据库密码（建议修改）
DB_ROOT_PASSWORD=your_secure_password

# JWT密钥（必须修改）
JWT_SECRET=your-very-secure-jwt-secret-key

# OpenAI API配置（可选，用于AI出题功能）
OPENAI_API_KEY=sk-your-api-key
OPENAI_API_URL=https://api.openai.com/v1
```

#### 4. 一键启动

```bash
docker-compose up -d
```

#### 5. 访问系统

打开浏览器访问 http://localhost

默认管理员账号：
- 用户名：`admin`
- 密码：`admin123`

#### 6. 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v

# 重新构建并启动
docker-compose up -d --build
```

### 方式二：本地开发部署

#### 1. 环境要求

- Node.js >= 16
- MySQL 8.0
- npm 或 yarn

#### 2. 数据库配置

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE smart_assessment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入数据库结构
mysql -u root -p smart_assessment < database/init.sql
```

#### 3. 后端配置

```bash
cd server
cp .env.example .env
# 编辑 .env 配置数据库连接信息
npm install
npm run init-db
npm run seed
npm run dev
```

#### 4. 前端配置

```bash
cd client
npm install
npm run dev
```

#### 5. 访问系统

打开浏览器访问 http://localhost:3000

## 项目结构

```
smart-assessment/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── layouts/       # 布局组件
│   │   └── services/      # API服务
│   ├── Dockerfile         # 前端Docker配置
│   ├── nginx.conf         # Nginx配置
│   └── package.json
│
├── server/                 # 后端项目
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── middleware/     # 中间件
│   │   └── config/         # 配置文件
│   ├── scripts/           # 初始化脚本
│   ├── Dockerfile         # 后端Docker配置
│   └── package.json
│
├── database/              # 数据库脚本
│   └── init.sql           # 数据库初始化SQL
│
├── docker-compose.yml     # Docker Compose配置
├── .env.example           # 环境变量示例
└── README.md
```

## API文档

### 认证

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login-by-code | 手机验证码登录 |

### 课程

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/courses | 获取课程列表 |
| GET | /api/courses/:id | 获取课程详情 |

### 题库

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/questions | 获取题库列表 |
| POST | /api/questions | 添加题目 |
| PUT | /api/questions/:id | 更新题目 |
| DELETE | /api/questions/:id | 删除题目 |
| POST | /api/questions/ai-generate | AI生成题目 |

### 测评

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/exams/generate-paper | 生成试卷 |
| POST | /api/exams/start | 开始测评 |
| PUT | /api/exams/:id/submit | 提交测评 |

### 报告

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/reports/personal/:recordId | 个人报告 |
| GET | /api/reports/export/:recordId | 导出PDF |
| GET | /api/reports/class/:courseId | 班级报表 |

### 通知

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/notices/templates | 获取模板列表 |
| POST | /api/notices/send-admission | 发送录取通知 |

## 能力等级

| 等级 | 分数区间 | 建议班级 |
|------|----------|----------|
| A级 | 90-100 | 培优班 |
| B级 | 75-89 | 基础班 |
| C级 | 60-74 | 预备班 |
| D级 | 0-59 | 基础班 |

## 生产环境部署建议

1. **修改默认密码**：登录后立即修改管理员密码
2. **配置HTTPS**：使用 Nginx 反向代理配置 SSL 证书
3. **数据库备份**：定期备份 MySQL 数据
4. **修改JWT密钥**：使用强随机字符串作为JWT密钥
5. **限制端口暴露**：仅暴露必要的80/443端口

## 故障排查

### 容器无法启动

```bash
# 查看容器日志
docker-compose logs server
docker-compose logs client
docker-compose logs mysql
```

### 数据库连接失败

```bash
# 检查MySQL容器状态
docker-compose ps mysql

# 进入MySQL容器检查
docker-compose exec mysql mysql -u root -p
```

### 前端无法访问API

检查 nginx.conf 中的代理配置是否正确，确保后端服务正常运行。

## License

MIT
