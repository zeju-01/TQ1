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

// 查询入库单号对应的记录
const stockInNumber = 'SI202509250004';

console.log('查询入库单号:', stockInNumber);

db.all(`SELECT * FROM inventory WHERE stock_in_number = '${stockInNumber}'`, (err, rows) => {
  if (err) {
    console.error('查询失败:', err);
  } else {
    console.log('查询结果:');
    console.log('记录数量:', rows.length);
    rows.forEach((row, index) => {
      console.log(`记录 ${index + 1}:`, {
        id: row.id,
        imei: row.imei,
        product_name: row.product_name,
        product_model: row.product_model,
        operator: row.operator,
        factory_order: row.factory_order,
        stock_in_number: row.stock_in_number
      });
    });
  }
  
  // 关闭数据库连接
  db.close();
});