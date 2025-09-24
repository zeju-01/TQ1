const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 新密码
const NEW_PASSWORD = 'admin123';

console.log('数据库路径:', DB_PATH);

// 打开数据库连接
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  // 加密新密码
  const saltRounds = 10;
  bcrypt.hash(NEW_PASSWORD, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('密码加密失败:', err.message);
      db.close();
      return;
    }
    
    console.log('新密码哈希:', hashedPassword);
    
    // 更新admin用户的密码
    const query = 'UPDATE users SET password = ? WHERE username = ?';
    db.run(query, [hashedPassword, 'admin'], function(err) {
      if (err) {
        console.error('更新密码失败:', err.message);
      } else {
        console.log(`成功更新admin用户密码，影响行数: ${this.changes}`);
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
});