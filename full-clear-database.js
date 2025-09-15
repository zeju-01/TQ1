const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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
  
  // 清空所有表的数据
  const tables = ['inventory', 'products', 'suppliers', 'business_staff', 'operators', 'couriers', 'users'];
  
  let completed = 0;
  tables.forEach(table => {
    db.run(`DELETE FROM ${table}`, (err) => {
      if (err) {
        console.error(`清空 ${table} 表失败:`, err.message);
      } else {
        console.log(`${table} 表已清空`);
      }
      
      completed++;
      if (completed === tables.length) {
        // 插入默认管理员账户
        const insertAdmin = `
          INSERT INTO users (username, password, role, full_name, permission) 
          VALUES ('superadmin', '$2b$10$mByZQ7y3HdGnuXTcmNt/zuQjJOa5T4gOVF9iaelPA1Tpb1bW47Lq2', 'admin', '超级管理员', 'admin')
        `;
        
        db.run(insertAdmin, (err) => {
          if (err) {
            console.error('插入默认管理员账户失败:', err.message);
          } else {
            console.log('默认管理员账户已插入');
          }
          
          db.close((err) => {
            if (err) {
              console.error('关闭数据库连接失败:', err.message);
            } else {
              console.log('数据库连接已关闭');
              console.log('数据库清空完成！');
            }
          });
        });
      }
    });
  });
});