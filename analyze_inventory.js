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
  // 查询所有记录的详细信息
  db.all("SELECT id, product_name, imei, transaction_type, stock_in_status, stock_out_status, created_at FROM inventory ORDER BY id", (err, rows) => {
    if (err) {
      console.error('查询记录失败:', err.message);
    } else {
      console.log('所有库存记录:');
      console.log('ID\t产品名称\t\tIMEI\t\t\t交易类型\t入库状态\t出库状态\t创建时间');
      console.log('------------------------------------------------------------------------------------------------------------------------');
      
      rows.forEach(row => {
        console.log(`${row.id}\t${row.product_name || ''}\t\t${row.imei || ''}\t${row.transaction_type || ''}\t\t${row.stock_in_status || 'NULL'}\t\t${row.stock_out_status || 'NULL'}\t${row.created_at || ''}`);
      });
      
      console.log(`\n总记录数: ${rows.length}`);
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