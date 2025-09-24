# 互联网模组出入库管理系统

## 项目概述

基于Web的互联网模组出入库管理系统，专门用于管理具有唯一IMEI号的互联网模组设备。系统提供完整的库存管理、出入库记录、设备追踪和数据统计功能。

## 技术栈

### 前端
- React 18
- Vite 4.x
- TypeScript
- Ant Design UI 组件库
- React Router DOM
- Axios HTTP 客户端
- React Query 数据状态管理

### 后端
- Node.js 18+
- Express.js 4.x
- MySQL 8.0
- JWT 认证
- Multer 文件上传
- bcryptjs 密码加密
- CORS 跨域处理

### 开发工具
- ESLint 代码规范
- Prettier 代码格式化
- Nodemon 开发热重载

## 项目结构

```
TQ1/
├── backend/                    # 后端API服务
│   ├── config/                 # 配置文件
│   ├── controllers/            # 控制器
│   ├── middleware/             # 中间件
│   ├── models/                 # 数据模型
│   ├── routes/                 # 路由定义
│   ├── utils/                  # 工具函数
│   ├── uploads/                # 文件上传目录
│   └── server.js               # 服务器入口文件
├── frontend/                   # 前端React应用
│   ├── public/                 # 静态资源
│   ├── src/                    # 源代码
│   │   ├── components/         # 通用组件
│   │   ├── pages/              # 页面组件
│   │   ├── hooks/              # 自定义Hook
│   │   ├── services/           # API服务
│   │   ├── store/              # 状态管理
│   │   ├── utils/              # 工具函数
│   │   └── styles/             # 样式文件
│   ├── package.json            # 依赖配置
│   └── vite.config.ts          # Vite配置
├── database/                   # 数据库脚本
│   ├── init.sql                # 初始化脚本
│   └── seed.sql                # 测试数据
└── docs/                       # 文档
    ├── api.md                  # API文档
    └── deployment.md           # 部署文档
```

## 核心功能

- 🔐 用户认证与权限管理
- 📦 产品信息管理
- 📋 供应商管理
- 👥 业务人员管理
- 📥 入库管理（单个/批量/表格导入）
- 📤 出库管理
- 🔄 退库管理
- 📊 库存查询与统计
- 📁 文件上传与管理
- 📈 数据报表生成

## 安装和运行

### 前置要求
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 后端安装
```bash
cd backend
npm install
npm run dev
```

### 前端安装
```bash
cd frontend
npm install
npm run dev
```

### 数据库设置
```bash
mysql -u root -p < database/init.sql
mysql -u root -p < database/seed.sql
```

## 开发规范

- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 使用Prettier统一代码格式
- 提交前执行代码检查

## 许可证

MIT License