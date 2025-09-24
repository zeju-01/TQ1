const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkUserTableStructure() {
  try {
    // 打开数据库连接
    const db = await open({
      filename: path.join(__dirname, 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 查询用户表结构
    const result = await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
    console.log('用户表结构:');
    console.log(result.sql);
    
    // 关闭数据库连接
    await db.close();
  } catch (error) {
    console.error('查询数据库失败:', error);
  }
}

checkUserTableStructure();