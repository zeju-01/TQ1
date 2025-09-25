const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 要删除的入库单号
const stockInNumbersToDelete = ['SI202509259999', 'SI202509258888', 'SI2025092510000'];

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  // 查找要删除的记录
  const placeholders = stockInNumbersToDelete.map(() => '?').join(',');
  const query = `SELECT id, product_name, stock_in_number, stock_in_date, created_at FROM inventory WHERE stock_in_number IN (${placeholders})`;
  
  db.all(query, stockInNumbersToDelete, (err, rows) => {
    if (err) {
      console.error('查询记录失败:', err.message);
      return;
    }
    
    console.log('找到以下要删除的记录:');
    if (rows.length === 0) {
      console.log('没有找到匹配的记录');
    } else {
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}, 产品: ${row.product_name}, 入库单号: ${row.stock_in_number}, 入库日期: ${row.stock_in_date}, 创建时间: ${row.created_at}`);
      });
      
      console.log(`\n总共找到 ${rows.length} 条记录`);
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