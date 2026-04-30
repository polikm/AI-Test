# 智能测评系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

面向素质教育机构的智能入学测评系统，支持1-9年级学生的AIGC素养课和编程课入学测评。

## 功能特性

### 核心功能

- 🎓 **智能组卷** - 根据学生年级、能力基础自动生成测评试卷，支持多维度题目分布
- 📊 **个性化报告** - 多维度能力分析、可视化图表、个性化学习建议和班级推荐
- 🔐 **多角色权限** - 学生、教师、管理员三种角色，精细化权限控制

### 用户端功能

| 角色 | 功能模块 |
|------|----------|
| 👨‍🎓 学生端 | 信息填写、在线测评、查看报告、接收录取通知 |
| 👨‍🏫 教师端 | 学生管理、测评记录查看、班级报表、发送录取通知 |
| ⚙️ 管理端 | 用户管理、题库管理、课程管理、系统配置、通知模板 |

### AI 能力

- 🤖 **AI出题** - 基于 OpenAI API 智能生成题目
- 📈 **智能分析** - 自动分析学生能力维度，给出学习建议

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 |
| UI组件库 | Ant Design 5 |
| 图表可视化 | ECharts |
| 后端框架 | Node.js + Express |
| 数据库 | MySQL 8.0 |
| 认证方式 | JWT |
| 容器化 | Docker + Docker Compose |
| AI集成 | OpenAI API（可选） |

## 快速开始

### 方式一：Docker 一键部署（推荐）

#### 环境要求

- Docker >= 20.10
- Docker Compose >= 2.0

#### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/polikm/AI-Test.git
cd AI-Test/smart-assessment

# 2. 配置环境变量
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库密码（建议修改）
DB_ROOT_PASSWORD=your_secure_password

# JWT密钥（生产环境必须修改）
JWT_SECRET=your-very-secure-jwt-secret-key

# OpenAI API配置（可选，用于AI出题功能）
OPENAI_API_KEY=sk-your-api-key
OPENAI_API_URL=https://api.openai.com/v1
```

```bash
# 3. 一键启动
docker-compose up -d

# 4. 查看服务状态
docker-compose ps
```

#### 访问系统

- 访问地址：http://localhost
- 默认管理员账号：`admin`
- 默认密码：`admin123`

#### 常用命令

```bash
# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v

# 重新构建并启动
docker-compose up -d --build
```

---

### 方式二：本地开发部署

#### 环境要求

- Node.js >= 16
- MySQL 8.0
- npm 或 yarn

#### 后端部署

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE smart_assessment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 导入数据库结构
mysql -u root -p smart_assessment < database/init.sql

# 3. 配置后端
cd server
cp .env.example .env
# 编辑 .env 配置数据库连接信息

# 4. 安装依赖并启动
npm install
npm run dev
```

后端服务运行在 http://localhost:3001

#### 前端部署

```bash
# 1. 安装依赖
cd client
npm install

# 2. 启动开发服务器
npm run dev
```

前端服务运行在 http://localhost:3000

## 项目结构

```
smart-assessment/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   │   ├── admin/        # 管理端页面
│   │   │   ├── teacher/      # 教师端页面
│   │   │   └── student/      # 学生端页面
│   │   ├── layouts/          # 布局组件
│   │   ├── services/         # API服务层
│   │   └── index.css         # 全局样式
│   ├── Dockerfile            # 前端Docker配置
│   ├── nginx.conf            # Nginx配置
│   └── package.json
│
├── server/                    # 后端项目
│   ├── src/
│   │   ├── routes/           # API路由
│   │   │   ├── auth.js       # 认证路由
│   │   │   ├── exams.js      # 测评路由
│   │   │   ├── questions.js  # 题库路由
│   │   │   ├── reports.js    # 报告路由
│   │   │   └── ...
│   │   ├── middleware/       # 中间件
│   │   │   └── auth.js       # JWT认证中间件
│   │   └── config/           # 配置文件
│   │       └── database.js   # 数据库配置
│   ├── scripts/              # 初始化脚本
│   │   ├── init-db.js        # 数据库初始化
│   │   └── seed-questions.js # 示例数据
│   ├── Dockerfile            # 后端Docker配置
│   └── package.json
│
├── database/                  # 数据库脚本
│   └── init.sql              # 数据库初始化SQL
│
├── docker-compose.yml        # Docker Compose配置
├── .env.example              # 环境变量示例
└── README.md
```

## API 文档

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login-by-code` | 手机验证码登录 |
| POST | `/api/auth/send-code` | 发送验证码 |

### 课程接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/courses` | 获取课程列表 |
| GET | `/api/courses/:id` | 获取课程详情 |

### 题库接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/questions` | 获取题库列表（支持分页、筛选） |
| POST | `/api/questions` | 添加题目 |
| PUT | `/api/questions/:id` | 更新题目 |
| DELETE | `/api/questions/:id` | 删除题目 |
| POST | `/api/questions/ai-generate` | AI生成题目 |

### 测评接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/exams/generate-paper` | 智能生成试卷 |
| POST | `/api/exams/start` | 开始测评 |
| PUT | `/api/exams/:id/submit` | 提交测评答案 |
| GET | `/api/exams/records/:studentId` | 获取学生测评记录 |

### 报告接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/reports/personal/:recordId` | 获取个人测评报告 |
| GET | `/api/reports/export/:recordId` | 导出PDF报告 |
| GET | `/api/reports/class/:courseId` | 获取班级报表 |

### 通知接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/notices/templates` | 获取通知模板列表 |
| POST | `/api/notices/send-admission` | 发送录取通知 |

## 能力等级评定

系统根据测评成绩自动评定学生能力等级，并推荐合适的班级：

| 等级 | 分数区间 | 能力描述 | 推荐班级 |
|------|----------|----------|----------|
| A级 | 90-100分 | 优秀，具备扎实的知识基础和较强的思维能力 | 培优班 |
| B级 | 75-89分 | 良好，基础知识掌握较好，需要进一步提升 | 基础班 |
| C级 | 60-74分 | 及格，基础知识有待加强 | 预备班 |
| D级 | 0-59分 | 需要加强基础学习 | 基础班 |

## 生产环境部署建议

1. **安全配置**
   - 登录后立即修改管理员默认密码
   - 使用强随机字符串作为 JWT 密钥
   - 仅暴露必要的 80/443 端口

2. **HTTPS 配置**
   - 使用 Nginx 反向代理配置 SSL 证书
   - 推荐 Let's Encrypt 免费证书

3. **数据备份**
   - 定期备份 MySQL 数据
   - 建议使用定时任务自动备份

4. **性能优化**
   - 开启 Nginx Gzip 压缩
   - 配置静态资源缓存
   - 根据访问量调整容器资源限制

## 故障排查

### 容器无法启动

```bash
# 查看各容器日志
docker-compose logs mysql
docker-compose logs server
docker-compose logs client
```

### 数据库连接失败

```bash
# 检查 MySQL 容器状态
docker-compose ps mysql

# 进入 MySQL 容器检查
docker-compose exec mysql mysql -u root -p
```

### 前端无法访问 API

1. 检查 `nginx.conf` 中的代理配置
2. 确认后端服务正常运行
3. 检查浏览器控制台的网络请求

## 开发计划

- [ ] 支持更多题型（编程题自动评判）
- [ ] 微信小程序端
- [ ] 更丰富的数据统计分析
- [ ] 支持多语言

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## License

[MIT](LICENSE)

---

**作者**：polikm

**项目地址**：https://github.com/polikm/AI-Test
