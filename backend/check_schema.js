const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'data', 'inventory.db');

// 打开数据库连接
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('无法连接到数据库:', err.message);
    return;
  }
  console.log('成功连接到数据库');
});

// 查询表结构
db.serialize(() => {
  db.all("PRAGMA table_info(products)", [], (err, rows) => {
    if (err) {
      console.error('查询失败:', err.message);
      return;
    }
    console.log('Products表结构:');
    console.table(rows);
  });
});

// 关闭数据库连接
db.close((err) => {
  if (err) {
    console.error('关闭数据库连接时出错:', err.message);
  }
});