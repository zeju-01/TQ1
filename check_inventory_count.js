const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径 - 使用正确的路径
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
    
    // 查询各种状态的记录数
    db.get("SELECT COUNT(*) as inCount FROM inventory WHERE transaction_type = 'in'", (err, row) => {
      if (err) {
        console.error('查询入库记录数失败:', err.message);
        return;
      }
      console.log('入库记录数:', row.inCount);
      
      db.get("SELECT COUNT(*) as outCount FROM inventory WHERE transaction_type = 'out'", (err, row) => {
        if (err) {
          console.error('查询出库记录数失败:', err.message);
          return;
        }
        console.log('出库记录数:', row.outCount);
        
        db.get("SELECT COUNT(*) as returnCount FROM inventory WHERE return_status = '已退库'", (err, row) => {
          if (err) {
            console.error('查询退库记录数失败:', err.message);
            return;
          }
          console.log('退库记录数:', row.returnCount);
          
          // 检查是否有重复的IMEI
          db.all(`
            SELECT imei, COUNT(*) as count 
            FROM inventory 
            WHERE imei IS NOT NULL AND imei != '' 
            GROUP BY imei 
            HAVING COUNT(*) > 1
          `, (err, rows) => {
            if (err) {
              console.error('查询重复IMEI失败:', err.message);
              return;
            }
            console.log('重复IMEI数量:', rows.length);
            if (rows.length > 0) {
              console.log('重复的IMEI:', rows);
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
    });
  });
});