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
  
  // 查询当前journal模式
  db.get("PRAGMA journal_mode;", (err, row) => {
    if (err) {
      console.error('查询journal模式失败:', err.message);
      return;
    }
    console.log('当前journal模式:', row);
    
    // 查询是否有未完成的事务
    db.get("PRAGMA wal_checkpoint(TRUNCATE);", (err, row) => {
      if (err) {
        console.error('执行wal_checkpoint失败:', err.message);
        return;
      }
      console.log('WAL检查点结果:', row);
      
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