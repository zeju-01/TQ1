const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// 中间件
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 捕获所有请求并打印
app.use('*', (req, res, next) => {
  console.log(`\n=== ${req.method} ${req.originalUrl} ===`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // 检查是否包含废弃字段
  if (req.body) {
    if ('stock_in_auto_number' in req.body) {
      console.log('⚠️  发现废弃字段 stock_in_auto_number:', req.body.stock_in_auto_number);
    }
    if ('stock_in_time' in req.body) {
      console.log('⚠️  发现字段 stock_in_time:', req.body.stock_in_time);
    }
  }
  
  next();
});

// 模拟入库接口
app.post('/api/inventory/stock-in', (req, res) => {
  res.json({
    success: true,
    message: '入库成功',
    data: { id: 1, ...req.body }
  });
});

// 模拟批量入库接口
app.post('/api/inventory/stock-in/batch', (req, res) => {
  res.json({
    success: true,
    message: '批量入库成功',
    data: req.body.stockInList
  });
});

app.listen(port, () => {
  console.log(`请求捕获服务器运行在 http://localhost:${port}`);
});