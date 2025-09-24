const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 检查数据库文件是否存在
if (!fs.existsSync(DB_PATH)) {
  console.error('数据库文件不存在:', DB_PATH);
  process.exit(1);
}

console.log('数据库文件路径:', DB_PATH);

// 连接到数据库
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
});

// 查询库存记录
db.all('SELECT id, imei, stock_in_document, created_at FROM inventory ORDER BY created_at DESC LIMIT 10', [], (err, rows) => {
  if (err) {
    console.error('查询失败:', err.message);
    return;
  }
  
  console.log('最近10条库存记录:');
  console.log('ID\tIMEI\t\t\t收货单据\t\t创建时间');
  console.log('------------------------------------------------------------------------');
  
  rows.forEach(row => {
    console.log(`${row.id}\t${row.imei || 'N/A'}\t${row.stock_in_document || 'N/A'}\t${row.created_at || 'N/A'}`);
  });
});

// 查询有收货单据的记录数量
db.get('SELECT COUNT(*) as count FROM inventory WHERE stock_in_document IS NOT NULL AND stock_in_document != ""', [], (err, row) => {
  if (err) {
    console.error('查询收货单据记录数量失败:', err.message);
    return;
  }
  
  console.log(`\n有收货单据的记录数量: ${row.count}`);
});

// 查询总记录数量
db.get('SELECT COUNT(*) as count FROM inventory', [], (err, row) => {
  if (err) {
    console.error('查询总记录数量失败:', err.message);
    return;
  }
  
  console.log(`总记录数量: ${row.count}`);
  
  // 关闭数据库连接
  db.close((err) => {
    if (err) {
      console.error('关闭数据库连接失败:', err.message);
    } else {
      console.log('数据库连接已关闭');
    }
  });
});