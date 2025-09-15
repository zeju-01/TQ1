const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkAllTableStructures() {
  try {
    // 打开数据库连接
    const db = await open({
      filename: path.join(__dirname, 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 检查所有相关表的结构
    const tables = ['suppliers', 'operators', 'couriers', 'business_staff'];
    
    for (const table of tables) {
      console.log(`\n=== ${table} 表结构 ===`);
      const result = await db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${table}'`);
      if (result && result.sql) {
        console.log(result.sql);
      } else {
        console.log('表不存在');
      }
    }
    
    // 关闭数据库连接
    await db.close();
  } catch (error) {
    console.error('查询数据库失败:', error);
  }
}

checkAllTableStructures();