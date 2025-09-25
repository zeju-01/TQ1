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
  
  // 查询当前记录数
  db.get("SELECT COUNT(*) as total FROM inventory", (err, row) => {
    if (err) {
      console.error('查询记录数失败:', err.message);
      return;
    }
    console.log('当前数据库记录数:', row.total);
    
    // 执行WAL检查点，将数据从WAL文件合并到主数据库文件
    db.exec("PRAGMA wal_checkpoint(TRUNCATE);", (err) => {
      if (err) {
        console.error('执行WAL检查点失败:', err.message);
        return;
      }
      console.log('WAL检查点执行成功，数据已合并到主数据库文件');
      
      // 再次查询记录数确认
      db.get("SELECT COUNT(*) as total FROM inventory", (err, row) => {
        if (err) {
          console.error('查询记录数失败:', err.message);
          return;
        }
        console.log('检查点后数据库记录数:', row.total);
        
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