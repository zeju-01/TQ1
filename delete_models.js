const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 要删除的产品型号
const productModelsToDelete = ['BC26', 'EC200U-CN', 'RG500Q-EA', 'M26'];

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  // 开始事务
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // 删除指定产品型号的记录
    const placeholders = productModelsToDelete.map(() => '?').join(',');
    const deleteQuery = `DELETE FROM inventory WHERE product_model IN (${placeholders})`;
    
    db.run(deleteQuery, productModelsToDelete, function(err) {
      if (err) {
        console.error('删除记录失败:', err.message);
        db.run('ROLLBACK');
        return;
      }
      
      console.log(`成功删除 ${this.changes} 条记录`);
      
      // 提交事务
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('提交事务失败:', err.message);
          return;
        }
        
        console.log('事务提交成功');
        
        // 验证删除结果
        const countQuery = `SELECT COUNT(*) as count FROM inventory`;
        db.get(countQuery, (err, row) => {
          if (err) {
            console.error('查询记录总数失败:', err.message);
            return;
          }
          
          console.log(`删除后数据库中剩余记录数: ${row.count}`);
          
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