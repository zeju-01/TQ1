const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'backend', 'data', 'inventory.db');

console.log('数据库路径:', DB_PATH);

// 检查数据库文件是否存在
const fs = require('fs');
if (!fs.existsSync(DB_PATH)) {
  console.log('数据库文件不存在');
  process.exit(1);
}

// 连接到数据库
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    process.exit(1);
  }
  console.log('成功连接到数据库');
});

// 查询记录数
db.serialize(() => {
  // 查询库存表总记录数
  db.get("SELECT COUNT(*) as count FROM inventory", (err, row) => {
    if (err) {
      console.error('查询库存表记录数失败:', err.message);
    } else {
      console.log('库存表总记录数:', row.count);
    }
  });
  
  // 查询不同transaction_type的记录数
  db.all("SELECT transaction_type, COUNT(*) as count FROM inventory GROUP BY transaction_type", (err, rows) => {
    if (err) {
      console.error('查询transaction_type分组记录数失败:', err.message);
    } else {
      console.log('按transaction_type分组的记录数:');
      rows.forEach(row => {
        console.log(`  ${row.transaction_type}: ${row.count}`);
      });
    }
  });
  
  // 查询不同状态的记录数
  db.all("SELECT stock_in_status, COUNT(*) as count FROM inventory GROUP BY stock_in_status", (err, rows) => {
    if (err) {
      console.error('查询stock_in_status分组记录数失败:', err.message);
    } else {
      console.log('按stock_in_status分组的记录数:');
      rows.forEach(row => {
        console.log(`  ${row.stock_in_status || 'NULL'}: ${row.count}`);
      });
    }
  });
  
  // 查询不同出库状态的记录数
  db.all("SELECT stock_out_status, COUNT(*) as count FROM inventory GROUP BY stock_out_status", (err, rows) => {
    if (err) {
      console.error('查询stock_out_status分组记录数失败:', err.message);
    } else {
      console.log('按stock_out_status分组的记录数:');
      rows.forEach(row => {
        console.log(`  ${row.stock_out_status || 'NULL'}: ${row.count}`);
      });
    }
    
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  });
});