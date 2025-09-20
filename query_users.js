const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 打开数据库连接
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('无法连接到数据库:', err.message);
    return;
  }
  console.log('成功连接到SQLite数据库');
  
  // 查询所有用户
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      console.error('查询用户数据失败:', err.message);
      return;
    }
    
    console.log('用户数据:');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, 用户名: ${row.username}, 角色: ${row.role}, 权限: ${row.permission}`);
      console.log(`  全名: ${row.full_name}, 缩写: ${row.abbreviation}`);
      console.log(`  创建时间: ${row.created_at}, 更新时间: ${row.updated_at}`);
      console.log('---');
    });
    
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接时出错:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  });
});