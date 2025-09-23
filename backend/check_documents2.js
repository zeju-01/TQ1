const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/inventory.db');

// 检查包含文件信息的记录
db.all('SELECT id, stock_in_document, stock_in_number, created_at FROM inventory WHERE stock_in_document IS NOT NULL AND stock_in_document != "" ORDER BY id DESC LIMIT 10', (err, rows) => {
  if (err) {
    console.error('查询出错:', err);
  } else {
    console.log('包含文件信息的记录:');
    console.log(rows);
  }
  
  // 检查最近的所有记录
  db.all('SELECT id, stock_in_document, stock_in_number, created_at FROM inventory ORDER BY id DESC LIMIT 10', (err, rows) => {
    if (err) {
      console.error('查询出错:', err);
    } else {
      console.log('\n最近的10条记录:');
      console.log(rows);
    }
    db.close();
  });
});