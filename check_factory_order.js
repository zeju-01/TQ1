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

// 查询包含特定工厂工单的数据
const factoryOrder = 'M101-SZ2507180003';

db.all(`SELECT DISTINCT factory_order FROM inventory WHERE factory_order LIKE '%${factoryOrder}%'`, (err, rows) => {
  if (err) {
    console.error('查询失败:', err);
  } else {
    console.log('匹配的工厂工单:');
    console.log(rows);
  }
  
  // 查询所有工厂工单（前10条）
  db.all('SELECT id, factory_order FROM inventory WHERE factory_order IS NOT NULL LIMIT 10', (err, rows) => {
    if (err) {
      console.error('查询失败:', err);
    } else {
      console.log('数据库中的工厂工单示例（前10条）:');
      console.log(rows);
    }
    
    // 关闭数据库连接
    db.close();
  });
});