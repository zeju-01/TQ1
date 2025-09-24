const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 连接到数据库
const dbPath = path.join('backend', 'data', 'inventory.db');
const db = new sqlite3.Database(dbPath);

console.log('检查 inventory 表结构...');

db.serialize(() => {
  // 查询表结构
  db.all("PRAGMA table_info(inventory)", (err, rows) => {
    if (err) {
      console.error('查询表结构出错:', err);
      return;
    }
    
    console.log('相关字段结构:');
    rows.forEach(row => {
      if (row.name === 'stock_in_time' || row.name === 'stock_in_auto_number' || row.name === 'stock_in_document') {
        console.log(`  ${row.name}: ${row.type}, ${row.notnull ? 'NOT NULL' : 'NULL'}, 默认值: ${row.dflt_value || '无'}`);
      }
    });
    
    db.close();
  });
});