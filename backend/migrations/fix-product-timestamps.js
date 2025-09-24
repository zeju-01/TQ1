// 修复产品表时间字段的数据库迁移脚本
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrateProductTable() {
  let db;
  try {
    // 打开数据库连接
    db = await open({
      filename: path.join(__dirname, '..', 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 开始事务
    await db.exec('BEGIN TRANSACTION');
    
    console.log('开始修复产品表时间字段...');
    
    // 1. 创建新的产品表，使用正确的北京时间格式
    await db.exec(`
      CREATE TABLE products_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100),
        model VARCHAR(50),
        description TEXT,
        abbreviation VARCHAR(20),
        created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
        updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))
      )
    `);
    
    console.log('创建新的产品表完成');
    
    // 2. 复制现有数据到新表（保持原有的created_at和updated_at值）
    await db.exec(`
      INSERT INTO products_new (id, name, model, description, abbreviation, created_at, updated_at)
      SELECT id, name, model, description, abbreviation, created_at, updated_at FROM products
    `);
    
    console.log('数据迁移完成');
    
    // 3. 删除旧表
    await db.exec('DROP TABLE products');
    
    console.log('删除旧表完成');
    
    // 4. 重命名新表
    await db.exec('ALTER TABLE products_new RENAME TO products');
    
    console.log('重命名新表完成');
    
    // 5. 重新创建索引（如果有的话）
    // 在这个案例中，产品表没有额外的索引
    
    // 提交事务
    await db.exec('COMMIT');
    
    console.log('产品表时间字段修复完成！');
    
    // 验证修复结果
    const result = await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='products'");
    console.log('修复后的产品表结构:');
    console.log(result.sql);
    
  } catch (error) {
    // 回滚事务
    if (db) {
      await db.exec('ROLLBACK');
    }
    console.error('迁移过程中发生错误:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    if (db) {
      await db.close();
    }
  }
}

// 执行迁移
migrateProductTable().catch(error => {
  console.error('迁移失败:', error);
  process.exit(1);
});