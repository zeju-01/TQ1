const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 打开数据库连接
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('无法连接到数据库:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  // 查询最新的5个供应商
  const sql = `SELECT id, company_name, created_at FROM suppliers ORDER BY id DESC LIMIT 5`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('查询错误:', err.message);
      return;
    }
    
    console.log('最新的5个供应商:');
    console.log('ID\t公司名称\t\t创建时间');
    console.log('------------------------------------------------');
    rows.forEach((row) => {
      console.log(`${row.id}\t${row.company_name}\t\t${row.created_at}`);
    });
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