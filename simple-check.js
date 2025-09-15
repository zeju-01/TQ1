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
  
  // 检查各表的记录数量
  const tables = ['users', 'products', 'suppliers', 'business_staff', 'operators', 'couriers', 'inventory'];
  
  let completed = 0;
  tables.forEach(table => {
    db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
      if (err) {
        console.error(`查询 ${table} 表失败:`, err.message);
      } else {
        console.log(`${table} 表记录数: ${row.count}`);
      }
      
      completed++;
      if (completed === tables.length) {
        db.close((err) => {
          if (err) {
            console.error('关闭数据库连接失败:', err.message);
          } else {
            console.log('数据库连接已关闭');
          }
        });
      }
    });
  });
});