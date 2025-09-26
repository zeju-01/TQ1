const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 连接到数据库
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err);
    return;
  }
  console.log('成功连接到数据库');
});

// 测试工厂工单搜索
const factoryOrder = 'M101-SZ2507180003';

console.log('测试SQL查询:', `SELECT DISTINCT stock_in_number FROM inventory WHERE factory_order LIKE '%${factoryOrder}%' AND stock_in_number IS NOT NULL AND stock_in_number != ''`);

db.all(`SELECT DISTINCT stock_in_number FROM inventory WHERE factory_order LIKE '%${factoryOrder}%' AND stock_in_number IS NOT NULL AND stock_in_number != ''`, (err, rows) => {
  if (err) {
    console.error('查询失败:', err);
  } else {
    console.log('查询结果:');
    console.log(rows);
  }
  
  // 关闭数据库连接
  db.close();
});