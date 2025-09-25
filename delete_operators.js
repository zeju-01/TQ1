const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 要删除的运营商和产品型号
const operatorsToDelete = ['中国联通', '中国移动', '测试运营商', '直接测试运营商', '完整流程测试运营商'];
const productModelsToDelete = ['EC600U-CN'];

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
    
    // 删除指定运营商的记录
    const operatorPlaceholders = operatorsToDelete.map(() => '?').join(',');
    const operatorDeleteQuery = `DELETE FROM inventory WHERE operator IN (${operatorPlaceholders})`;
    
    db.run(operatorDeleteQuery, operatorsToDelete, function(err) {
      if (err) {
        console.error('删除运营商记录失败:', err.message);
        db.run('ROLLBACK');
        return;
      }
      
      const deletedOperatorRecords = this.changes;
      console.log(`成功删除 ${deletedOperatorRecords} 条运营商记录`);
      
      // 删除指定产品型号的记录
      const modelPlaceholders = productModelsToDelete.map(() => '?').join(',');
      const modelDeleteQuery = `DELETE FROM inventory WHERE product_model IN (${modelPlaceholders})`;
      
      db.run(modelDeleteQuery, productModelsToDelete, function(err) {
        if (err) {
          console.error('删除产品型号记录失败:', err.message);
          db.run('ROLLBACK');
          return;
        }
        
        const deletedModelRecords = this.changes;
        console.log(`成功删除 ${deletedModelRecords} 条产品型号记录`);
        
        const totalDeletedRecords = deletedOperatorRecords + deletedModelRecords;
        console.log(`总共删除 ${totalDeletedRecords} 条记录`);
        
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
});