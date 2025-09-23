const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/inventory.db');

db.all('SELECT id, stock_in_document FROM inventory WHERE stock_in_document IS NOT NULL AND stock_in_document != "" LIMIT 5', (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('包含文件信息的库存记录:');
    console.log(rows);
  }
  
  // 检查最近的几条记录
  db.all('SELECT id, stock_in_document, created_at FROM inventory ORDER BY id DESC LIMIT 5', (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log('最近的库存记录:');
      console.log(rows);
    }
    db.close();
  });
});