# 项目启动指南

## 项目结构
```
TQ1/
├── backend/     # 后端服务
└── frontend/    # 前端应用
```

## 启动步骤

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖（首次运行）
npm install

# 启动后端服务
node server.js
```

默认端口：5002

### 2. 启动前端服务

```bash
# 进入前端目录
cd frontend

# 安装依赖（首次运行）
npm install

# 启动前端开发服务器
npm run dev
```

默认端口：5173

## 访问应用

1. 后端API: http://localhost:5002/api
2. 前端界面: http://localhost:5173
3. 健康检查: http://localhost:5002/health

## 默认管理员账户

- 用户名: superadmin
- 密码: admin123

## 常见问题解决

### 端口被占用
如果提示端口被占用，可以修改配置文件：
- 后端端口: 修改 `backend/.env` 文件中的 PORT 值
- 前端端口: 修改 `frontend/vite.config.ts` 文件中的 port 值

### 数据库问题
系统使用SQLite数据库，数据文件位于 `backend/data/inventory.db`。
如果遇到数据库问题，可以删除该文件让系统重新创建。

### 代理配置
前端通过代理访问后端API，配置在 `frontend/vite.config.ts` 中。
确保代理地址与后端实际运行地址一致。