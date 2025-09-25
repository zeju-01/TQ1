const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  // 查询最新的几条记录
  db.all(`
    SELECT id, product_name, imei, stock_in_date, created_at, stock_in_by
    FROM inventory 
    ORDER BY created_at DESC 
    LIMIT 10
  `, (err, rows) => {
    if (err) {
      console.error('查询最新记录失败:', err.message);
      return;
    }
    
    console.log('最新的10条记录:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, 产品: ${row.product_name}, IMEI: ${row.imei}, 入库日期: ${row.stock_in_date}, 创建时间: ${row.created_at}, 操作人: ${row.stock_in_by}`);
    });
    
    // 查询特定时间之后的记录
    db.all(`
      SELECT id, product_name, imei, stock_in_date, created_at, stock_in_by
      FROM inventory 
      WHERE created_at > '2025-09-25 15:09:52'
      ORDER BY created_at DESC
    `, (err, rows) => {
      if (err) {
        console.error('查询特定时间后记录失败:', err.message);
        return;
      }
      
      console.log('\n2025-09-25 15:09:52之后的记录:');
      if (rows.length === 0) {
        console.log('没有找到该时间之后的记录');
      } else {
        rows.forEach((row, index) => {
          console.log(`${index + 1}. ID: ${row.id}, 产品: ${row.product_name}, IMEI: ${row.imei}, 入库日期: ${row.stock_in_date}, 创建时间: ${row.created_at}, 操作人: ${row.stock_in_by}`);
        });
      }
      
      // 关闭数据库连接
      db.close((err) => {
        if (err) {
          console.error('关闭数据库连接失败:', err.message);
        } else {
          console.log('\n数据库连接已关闭');
        }
      });
    });
  });
});