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
  
  // 查询总记录数
  db.get("SELECT COUNT(*) as total FROM inventory", (err, row) => {
    if (err) {
      console.error('查询总记录数失败:', err.message);
      return;
    }
    console.log('数据库总记录数:', row.total);
    
    // 查询重复的IMEI记录
    db.all(`
      SELECT id, imei, product_name, stock_in_date, created_at
      FROM inventory 
      WHERE imei IN (
        SELECT imei
        FROM inventory 
        WHERE imei IS NOT NULL AND imei != '' 
        GROUP BY imei 
        HAVING COUNT(*) > 1
      )
      ORDER BY imei, id
    `, (err, rows) => {
      if (err) {
        console.error('查询重复记录失败:', err.message);
        return;
      }
      
      console.log('重复的IMEI记录:');
      console.log('记录数:', rows.length);
      
      // 按IMEI分组显示
      const grouped = {};
      rows.forEach(row => {
        if (!grouped[row.imei]) {
          grouped[row.imei] = [];
        }
        grouped[row.imei].push(row);
      });
      
      for (const imei in grouped) {
        console.log(`IMEI: ${imei}`);
        grouped[imei].forEach(record => {
          console.log(`  ID: ${record.id}, 产品: ${record.product_name}, 入库日期: ${record.stock_in_date}, 创建时间: ${record.created_at}`);
        });
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