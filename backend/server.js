// 互联网模组出入库管理系统后端服务器
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// 设置时区为北京时间
process.env.TZ = 'Asia/Shanghai';

// 导入配置和中间件
const { testConnection } = require('./config/database');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001; // 更改端口号为3001，避免端口冲突
const HOST = process.env.HOST || 'localhost';

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求限制中间件
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15分钟
  max: process.env.RATE_LIMIT_MAX || 100, // 限制每个IP每15分钟最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 基础中间件
app.use(compression()); // 响应压缩
app.use(morgan('combined')); // 请求日志
app.use(express.json({ limit: '10mb' })); // JSON解析
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL编码解析

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/debug', express.static(path.join(__dirname, 'public')));

// API路由 (稍后添加)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/operators', require('./routes/operators'));
app.use('/api/couriers', require('./routes/couriers'));
app.use('/api/business-staff', require('./routes/businessStaff'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/upload', require('./routes/upload'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API根路径
app.get('/api', (req, res) => {
  res.json({
    message: '互联网模组出入库管理系统 API',
    version: '1.0.0',
    timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      suppliers: '/api/suppliers',
      operators: '/api/operators',
      couriers: '/api/couriers',
      businessStaff: '/api/business-staff',
      inventory: '/api/inventory',
      reports: '/api/reports',
      upload: '/api/upload'
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '接口不存在',
    message: `路径 ${req.originalUrl} 未找到`,
    code: 'NOT_FOUND'
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    res.status(err.status || 500).json({
      error: '服务器内部错误',
      message: err.message,
      stack: err.stack,
      code: 'INTERNAL_SERVER_ERROR'
    });
  } else {
    // 生产环境返回简化错误信息
    res.status(err.status || 500).json({
      error: '服务器内部错误',
      message: '请联系系统管理员',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在优雅关闭...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在优雅关闭...');
  process.exit(0);
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('数据库连接失败，无法启动服务器');
      process.exit(1);
    }

    // 启动HTTP服务器
    app.listen(PORT, HOST, () => {
      console.log('=================================');
      console.log('🚀 互联网模组出入库管理系统后端服务器已启动');
      console.log(`📡 服务端口: ${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 API文档: http://localhost:${PORT}/api`);
      console.log(`💚 健康检查: http://localhost:${PORT}/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动应用
startServer();

module.exports = app;