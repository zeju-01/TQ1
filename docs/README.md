# 互联网模组出入库管理系统

## 系统概述

互联网模组出入库管理系统是一个基于Web的库存管理解决方案，专门用于管理具有唯一IMEI号的互联网模组设备。系统提供完整的库存管理、出入库记录、设备追踪和数据统计功能。

## 技术架构

### 后端技术栈
- **框架**: Express.js 4.x
- **数据库**: MySQL 8.0
- **认证**: JWT (JSON Web Tokens)
- **文件上传**: Multer
- **数据验证**: express-validator
- **密码加密**: bcryptjs

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 4.x
- **UI组件库**: Ant Design 5.x
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **路由**: React Router DOM
- **数据查询**: TanStack Query

## 核心功能

### 1. 用户认证与权限管理
- JWT令牌认证
- 多级权限控制（超级管理员、仓库管理员、操作员、查看员）
- 用户会话管理
- 密码安全加密

### 2. 产品信息管理
- 产品CRUD操作
- 供应商信息管理
- 业务人员信息管理
- 运营商分类管理

### 3. 库存管理核心功能
- **入库管理**
  - 单个设备入库
  - 批量设备入库
  - Excel表格批量导入
  - IMEI唯一性检查
  - 自动生成入库单号
- **出库管理**
  - 设备出库操作
  - 客户信息记录
  - 物流信息跟踪
- **退库管理**
  - 设备退库处理
  - 退库原因记录
  - 退库类型分类

### 4. 数据统计与报表
- 库存统计分析
- 出入库记录查询
- 数据导出功能
- 实时库存状态

### 5. 文件管理
- 单据文件上传
- Excel批量导入
- 文件存储管理
- 多格式文件支持

## 数据库设计

### 核心数据表
1. **users** - 用户信息表
2. **products** - 产品信息表
3. **suppliers** - 供应商信息表
4. **business_staff** - 业务人员信息表
5. **inventory** - 库存主表（包含入库、出库、退库信息）

### 关键特性
- IMEI号唯一性约束
- 自动生成入库/出库编号
- 完整的操作日志记录
- 支持复杂查询和统计

## API接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/me` - 获取当前用户信息

### 产品管理
- `GET /api/products` - 获取产品列表
- `POST /api/products` - 创建产品
- `PUT /api/products/:id` - 更新产品
- `DELETE /api/products/:id` - 删除产品

### 库存管理
- `GET /api/inventory` - 获取库存列表
- `POST /api/inventory/stock-in` - 入库操作
- `POST /api/inventory/stock-in/batch` - 批量入库
- `POST /api/inventory/stock-out` - 出库操作
- `POST /api/inventory/return` - 退库操作
- `GET /api/inventory/stats` - 获取库存统计

### 文件上传
- `POST /api/upload/single` - 单文件上传
- `POST /api/upload/multiple` - 多文件上传
- `POST /api/upload/excel` - Excel文件导入

## 安装部署

### 环境要求
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 后端部署

1. 安装依赖
```bash
cd backend
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

3. 初始化数据库
```bash
mysql -u root -p < database/init.sql
mysql -u root -p < database/seed.sql
```

4. 启动服务
```bash
npm run dev  # 开发环境
npm start    # 生产环境
```

### 前端部署

1. 安装依赖
```bash
cd frontend
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

## 系统截图

### 登录界面
- 用户友好的登录界面
- 支持用户名密码认证
- 响应式设计适配移动端

### 主面板
- 清晰的导航菜单
- 实时库存统计
- 快速操作入口

### 库存管理
- 完整的库存列表展示
- 强大的搜索和过滤功能
- 批量操作支持

## 开发规范

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 使用Prettier统一代码格式

### Git提交规范
- feat: 新功能
- fix: 错误修复
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构

## 安全特性

1. **身份认证安全**
   - JWT令牌机制
   - 令牌自动刷新
   - 会话超时控制

2. **数据安全**
   - 密码加密存储
   - SQL注入防护
   - XSS攻击防护

3. **权限控制**
   - 基于角色的访问控制
   - API接口权限验证
   - 前端页面权限控制

## 性能优化

1. **数据库优化**
   - 合理的索引设计
   - 查询性能优化
   - 分页查询支持

2. **前端优化**
   - 代码分割
   - 懒加载
   - 缓存策略

## 维护支持

### 日志记录
- 系统操作日志
- 错误日志记录
- 性能监控

### 数据备份
- 定期数据库备份
- 文件存储备份
- 灾难恢复方案

## 版本信息

- **当前版本**: 1.0.0
- **发布日期**: 2025-09-14
- **开发团队**: IOT Inventory Team

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。