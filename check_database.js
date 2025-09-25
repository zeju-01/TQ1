const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 连接到数据库
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');
  }
});

// 查询最新插入的记录
db.serialize(() => {
  // 查询最新插入的记录
  db.all('SELECT * FROM inventory ORDER BY id DESC LIMIT 5', [], (err, rows) => {
    if (err) {
      console.error('查询失败:', err.message);
    } else {
      console.log('最近5条库存记录:');
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}`);
        console.log(`   产品名称: ${row.product_name}`);
        console.log(`   产品型号: ${row.product_model}`);
        console.log(`   IMEI: ${row.imei}`);
        console.log(`   批次号: ${row.batch_number}`);
        console.log(`   入库数量: ${row.stock_in_quantity}`);
        console.log(`   供应商: ${row.supplier}`);
        console.log(`   入库日期: ${row.stock_in_date}`);
        console.log(`   入库时间: ${row.stock_in_time}`);
        console.log(`   入库单号: ${row.stock_in_number}`);
        console.log(`   入库状态: ${row.stock_in_status}`);
        console.log(`   操作员: ${row.stock_in_by}`);
        console.log('----------------------------------------');
      });
    }
  });
});

// 关闭数据库连接
db.close((err) => {
  if (err) {
    console.error('关闭数据库连接失败:', err.message);
  } else {
    console.log('数据库连接已关闭');
  }
});