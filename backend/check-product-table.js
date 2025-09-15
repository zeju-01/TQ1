const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkProductTableStructure() {
  try {
    // 打开数据库连接
    const db = await open({
      filename: path.join(__dirname, 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 查询当前产品表结构
    const currentStructure = await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='products'");
    console.log('当前产品表结构:');
    console.log(currentStructure.sql);
    
    console.log('\n代码中的产品表结构:');
    console.log(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100),
  model VARCHAR(50),
  description TEXT,
  abbreviation VARCHAR(20),
  created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
  updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))
)`);
    
    // 关闭数据库连接
    await db.close();
  } catch (error) {
    console.error('查询数据库失败:', error);
  }
}

checkProductTableStructure();