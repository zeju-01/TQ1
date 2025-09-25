const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'backend', 'data', 'inventory.db');

console.log('数据库路径:', DB_PATH);

// 检查数据库文件是否存在
const fs = require('fs');
if (!fs.existsSync(DB_PATH)) {
  console.log('数据库文件不存在');
  process.exit(1);
}

// 连接到数据库
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    process.exit(1);
  }
  console.log('成功连接到数据库');
});

// 模拟前端查询逻辑
db.serialize(() => {
  // 模拟前端库存列表查询（可能的过滤条件）
  console.log('\n=== 模拟前端库存查询 ===');
  
  // 1. 查询所有入库状态为"已入库"的记录
  db.get(`
    SELECT COUNT(*) as count 
    FROM inventory 
    WHERE stock_in_status = '已入库'
  `, (err, row) => {
    if (err) {
      console.error('查询已入库记录失败:', err.message);
    } else {
      console.log('已入库状态的记录数:', row.count);
    }
  });
  
  // 2. 查询transaction_type为'in'的记录
  db.get(`
    SELECT COUNT(*) as count 
    FROM inventory 
    WHERE transaction_type = 'in'
  `, (err, row) => {
    if (err) {
      console.error('查询transaction_type为in的记录失败:', err.message);
    } else {
      console.log('transaction_type为in的记录数:', row.count);
    }
  });
  
  // 3. 查询非空IMEI号的记录
  db.get(`
    SELECT COUNT(*) as count 
    FROM inventory 
    WHERE imei IS NOT NULL AND imei != ''
  `, (err, row) => {
    if (err) {
      console.error('查询非空IMEI记录失败:', err.message);
    } else {
      console.log('非空IMEI号的记录数:', row.count);
    }
  });
  
  // 4. 查询特定时间段的记录
  db.get(`
    SELECT COUNT(*) as count 
    FROM inventory 
    WHERE created_at >= '2025-09-25 00:00:00'
  `, (err, row) => {
    if (err) {
      console.error('查询今天创建的记录失败:', err.message);
    } else {
      console.log('今天创建的记录数:', row.count);
    }
  });
  
  // 5. 查询特定产品的记录
  db.get(`
    SELECT COUNT(*) as count 
    FROM inventory 
    WHERE product_name LIKE '%模组%'
  `, (err, row) => {
    if (err) {
      console.error('查询包含"模组"的产品记录失败:', err.message);
    } else {
      console.log('包含"模组"的产品记录数:', row.count);
    }
  });
  
  // 6. 查询所有记录（包括重复IMEI）
  db.get(`
    SELECT COUNT(*) as count 
    FROM inventory
  `, (err, row) => {
    if (err) {
      console.error('查询所有记录失败:', err.message);
    } else {
      console.log('所有记录数:', row.count);
    }
    
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err.message);
      } else {
        console.log('\n数据库连接已关闭');
      }
    });
  });
});