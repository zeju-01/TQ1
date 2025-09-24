// 检查用户数据
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('backend/data/inventory.db');

db.all('SELECT id, username, password FROM users', (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('用户表数据:');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, 用户名: ${row.username}, 密码: ${row.password}`);
    });
  }
  db.close();
});