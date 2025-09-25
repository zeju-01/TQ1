// 测试时间格式化函数
const { getBeijingTime, getBeijingDate } = require('./backend/utils/timeUtils');

console.log('当前北京时间:');
console.log('完整时间:', getBeijingTime());
console.log('日期部分:', getBeijingDate());

// 测试数据库时间插入
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function testDatabaseTime() {
  try {
    // 创建测试数据库连接
    const db = await open({
      filename: ':memory:', // 使用内存数据库进行测试
      driver: sqlite3.Database
    });
    
    // 设置时区
    await db.exec("PRAGMA time_zone = '+08:00'");
    
    // 创建测试表
    await db.exec(`
      CREATE TABLE test_time (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
        manual_time DATETIME
      )
    `);
    
    // 插入一条记录，手动设置时间
    const manualTime = getBeijingTime();
    console.log('手动设置的时间:', manualTime);
    
    await db.run('INSERT INTO test_time (manual_time) VALUES (?)', [manualTime]);
    
    // 查询记录
    const result = await db.get('SELECT * FROM test_time');
    console.log('数据库记录:', result);
    
    // 查询当前数据库时间
    const dbTime = await db.get("SELECT datetime('now', '+8 hours') as db_time");
    console.log('数据库当前时间:', dbTime.db_time);
    
    await db.close();
  } catch (error) {
    console.error('测试出错:', error);
  }
}

testDatabaseTime();