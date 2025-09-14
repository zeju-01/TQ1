// 数据库信息查看脚本
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const DB_PATH = path.join(__dirname, '..', 'data', 'inventory.db');

async function getDatabaseInfo() {
  try {
    // 检查数据库文件
    const stats = fs.statSync(DB_PATH);
    console.log('📊 数据库文件信息:');
    console.log(`   路径: ${DB_PATH}`);
    console.log(`   大小: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   创建时间: ${stats.birthtime.toLocaleString()}`);
    console.log(`   修改时间: ${stats.mtime.toLocaleString()}\n`);

    // 连接数据库
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // 获取表信息
    console.log('📋 数据库表信息:');
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    
    for (const table of tables) {
      const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`   ${table.name}: ${count.count} 条记录`);
    }

    console.log('\n🗂️ 详细数据统计:');
    
    // 供应商统计
    const suppliers = await db.all('SELECT company_name FROM suppliers LIMIT 5');
    console.log(`   供应商 (前5条): ${suppliers.map(s => s.company_name).join(', ')}`);
    
    // 业务人员统计
    const staff = await db.all('SELECT staff_name, position FROM business_staff LIMIT 5');
    console.log(`   业务人员 (前5条): ${staff.map(s => `${s.staff_name}(${s.position})`).join(', ')}`);

    await db.close();
    console.log('\n✅ 数据库持久化存储工作正常！');
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
  }
}

// 运行检查
getDatabaseInfo();