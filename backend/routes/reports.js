// 报表管理路由
const express = require('express');
const router = express.Router();

// 入库报表
router.get('/stock-in', (req, res) => {
  res.json({ message: '入库报表接口 - 待实现' });
});

// 出库报表
router.get('/stock-out', (req, res) => {
  res.json({ message: '出库报表接口 - 待实现' });
});

// 库存报表
router.get('/inventory', (req, res) => {
  res.json({ message: '库存报表接口 - 待实现' });
});

// 综合报表
router.get('/summary', (req, res) => {
  res.json({ message: '综合报表接口 - 待实现' });
});

module.exports = router;