/**
 * 产品表字段删除迁移脚本
 * 删除operator, supplier, salesperson, courier_company字段
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrateProductsTable() {
  // 数据库文件路径
  const DB_PATH = path.join(__dirname, '..', 'data', 'inventory.db');
  
  // 打开数据库连接
  const db = new sqlite3.Database(DB_PATH);
  
  return new Promise((resolve, reject) => {
    console.log('开始迁移产品表...');
    
    // 使用serialize确保操作按顺序执行
    db.serialize(async () => {
      try {
        // 检查是否需要迁移（检查是否存在要删除的字段）
        db.all("PRAGMA table_info(products)", [], (err, rows) => {
          if (err) {
            console.error('查询表结构失败:', err.message);
            reject(err);
            return;
          }
          
          console.log('当前表结构:', rows);
          
          // 检查是否存在要删除的字段
          const hasOperatorField = rows.some(row => row.name === 'operator');
          
          if (!hasOperatorField) {
            console.log('产品表已经是最新的结构，无需迁移');
            db.close();
            resolve();
            return;
          }
          
          console.log('开始执行迁移...');
          
          // 开始事务
          db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
              console.error('开始事务失败:', err.message);
              db.close();
              reject(err);
              return;
            }
            
            // 1. 创建新表（不包含要删除的字段）
            db.run(`
              CREATE TABLE products_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100),
                model VARCHAR(50),
                description TEXT,
                abbreviation VARCHAR(20),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `, (err) => {
              if (err) {
                console.error('创建新表失败:', err.message);
                db.run('ROLLBACK');
                db.close();
                reject(err);
                return;
              }
              
              console.log('创建新表完成');
              
              // 2. 复制数据（只复制保留的字段）
              db.run(`
                INSERT INTO products_new (id, name, model, description, abbreviation, created_at, updated_at)
                SELECT id, name, model, description, abbreviation, created_at, updated_at
                FROM products
              `, (err) => {
                if (err) {
                  console.error('复制数据失败:', err.message);
                  db.run('ROLLBACK');
                  db.close();
                  reject(err);
                  return;
                }
                
                console.log('数据复制完成');
                
                // 3. 删除旧表
                db.run('DROP TABLE products', (err) => {
                  if (err) {
                    console.error('删除旧表失败:', err.message);
                    db.run('ROLLBACK');
                    db.close();
                    reject(err);
                    return;
                  }
                  
                  console.log('删除旧表完成');
                  
                  // 4. 重命名新表
                  db.run('ALTER TABLE products_new RENAME TO products', (err) => {
                    if (err) {
                      console.error('重命名表失败:', err.message);
                      db.run('ROLLBACK');
                      db.close();
                      reject(err);
                      return;
                    }
                    
                    console.log('重命名表完成');
                    
                    // 提交事务
                    db.run('COMMIT', (err) => {
                      if (err) {
                        console.error('提交事务失败:', err.message);
                        db.close();
                        reject(err);
                        return;
                      }
                      
                      console.log('产品表迁移完成！');
                      db.close();
                      resolve();
                    });
                  });
                });
              });
            });
          });
        });
      } catch (error) {
        console.error('迁移过程中发生错误:', error);
        db.close();
        reject(error);
      }
    });
  });
}

// 执行迁移
if (require.main === module) {
  migrateProductsTable()
    .then(() => {
      console.log('迁移成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('迁移失败:', error);
      process.exit(1);
    });
}

module.exports = migrateProductsTable;