const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'data', 'inventory.db');

// 连接到数据库
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
});

// 查询最新的记录
const query = `
  SELECT id, product_name, product_model, imei 
  FROM inventory 
  WHERE id = (SELECT MAX(id) FROM inventory)
`;

db.all(query, (err, rows) => {
  if (err) {
    console.error('查询失败:', err.message);
    return;
  }
  
  console.log('最新记录:');
  rows.forEach((row, index) => {
    console.log(`${index + 1}. ID: ${row.id}`);
    console.log(`   产品名称: "${row.product_name}"`);
    console.log(`   产品型号: ${row.product_model}`);
    console.log(`   IMEI: ${row.imei}`);
    console.log('------------------------');
  });
  
  // 关闭数据库连接
  db.close((err) => {
    if (err) {
      console.error('关闭数据库连接失败:', err.message);
    } else {
      console.log('数据库连接已关闭');
    }
  });
});