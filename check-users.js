const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'backend', 'data', 'inventory.db');

console.log('数据库路径:', DB_PATH);

// 打开数据库连接
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  // 查询所有用户
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error('查询用户失败:', err.message);
    } else {
      console.log('用户表中的所有记录:');
      rows.forEach(row => {
        console.log('ID:', row.id);
        console.log('用户名:', row.username);
        console.log('角色:', row.role);
        console.log('权限:', row.permission);
        console.log('密码哈希:', row.password);
        console.log('最后登录时间:', row.last_login);
        console.log('---');
      });
      
      // 特别检查superadmin用户
      const superadmin = rows.find(user => user.username === 'superadmin');
      if (superadmin) {
        console.log('找到superadmin用户:');
        console.log('用户名:', superadmin.username);
        console.log('密码哈希:', superadmin.password);
        
        // 验证密码
        bcrypt.compare('admin123', superadmin.password, (err, result) => {
          if (err) {
            console.error('密码验证出错:', err.message);
          } else {
            console.log('密码验证结果:', result ? '正确' : '错误');
          }
          
          db.close((err) => {
            if (err) {
              console.error('关闭数据库连接失败:', err.message);
            } else {
              console.log('数据库连接已关闭');
            }
          });
        });
      } else {
        console.log('未找到superadmin用户');
        db.close((err) => {
          if (err) {
            console.error('关闭数据库连接失败:', err.message);
          } else {
            console.log('数据库连接已关闭');
          }
        });
      }
    }
  });
});