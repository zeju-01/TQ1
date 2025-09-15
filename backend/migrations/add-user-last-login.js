// 为用户表添加last_login字段的数据库迁移脚本
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function addUserLastLoginField() {
  let db;
  try {
    // 打开数据库连接
    db = await open({
      filename: path.join(__dirname, '..', 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 开始事务
    await db.exec('BEGIN TRANSACTION');
    
    console.log('开始为用户表添加last_login字段...');
    
    // 1. 检查last_login字段是否已存在
    const columnCheck = await db.get(`
      SELECT COUNT(*) as count 
      FROM pragma_table_info('users') 
      WHERE name = 'last_login'
    `);
    
    if (columnCheck.count > 0) {
      console.log('last_login字段已存在，跳过添加字段步骤');
    } else {
      // 2. 添加last_login字段
      await db.exec(`
        ALTER TABLE users 
        ADD COLUMN last_login DATETIME DEFAULT NULL
      `);
      console.log('添加last_login字段完成');
    }
    
    // 提交事务
    await db.exec('COMMIT');
    
    console.log('用户表last_login字段添加完成！');
    
    // 验证表结构
    const result = await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
    console.log('更新后的用户表结构:');
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
addUserLastLoginField().catch(error => {
  console.error('迁移失败:', error);
  process.exit(1);
});