// 检查数据库中 stock_in_auto_number 字段的实际值
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkDatabase() {
  try {
    // 连接到数据库
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 检查库存表结构
    console.log('\n1. 检查库存表结构...');
    const tableInfo = await db.all("PRAGMA table_info(inventory)");
    console.log('库存表字段:');
    tableInfo.forEach(field => {
      console.log(`  - ${field.name} (${field.type}) ${field.dflt_value ? `默认值: ${field.dflt_value}` : ''}`);
    });
    
    // 检查是否有记录包含 stock_in_auto_number 值
    console.log('\n2. 检查库存记录中的 stock_in_auto_number 值...');
    const recordsWithAutoNumber = await db.all(`
      SELECT id, stock_in_auto_number, stock_in_number, product_name, imei, created_at
      FROM inventory 
      WHERE stock_in_auto_number IS NOT NULL AND stock_in_auto_number != ''
      LIMIT 10
    `);
    
    if (recordsWithAutoNumber.length > 0) {
      console.log(`找到 ${recordsWithAutoNumber.length} 条包含 stock_in_auto_number 值的记录:`);
      recordsWithAutoNumber.forEach(record => {
        console.log(`  ID: ${record.id}, stock_in_auto_number: "${record.stock_in_auto_number}", stock_in_number: "${record.stock_in_number}", 产品: ${record.product_name}, IMEI: ${record.imei}`);
      });
    } else {
      console.log('没有找到包含 stock_in_auto_number 值的记录');
    }
    
    // 检查最近的入库记录
    console.log('\n3. 检查最近的5条入库记录...');
    const recentRecords = await db.all(`
      SELECT id, stock_in_auto_number, stock_in_number, product_name, imei, stock_in_time, created_at
      FROM inventory 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (recentRecords.length > 0) {
      console.log('最近的入库记录:');
      recentRecords.forEach(record => {
        console.log(`  ID: ${record.id}, stock_in_auto_number: "${record.stock_in_auto_number || 'NULL'}", stock_in_number: "${record.stock_in_number || 'NULL'}", 产品: ${record.product_name}, IMEI: ${record.imei}, 入库时间: ${record.stock_in_time}`);
      });
    } else {
      console.log('没有找到入库记录');
    }
    
    // 统计信息
    console.log('\n4. 统计信息...');
    const totalRecords = await db.get("SELECT COUNT(*) as count FROM inventory");
    const recordsWithAutoNumberCount = await db.get("SELECT COUNT(*) as count FROM inventory WHERE stock_in_auto_number IS NOT NULL AND stock_in_auto_number != ''");
    const recordsWithoutAutoNumberCount = await db.get("SELECT COUNT(*) as count FROM inventory WHERE stock_in_auto_number IS NULL OR stock_in_auto_number = ''");
    
    console.log(`  总记录数: ${totalRecords.count}`);
    console.log(`  包含 stock_in_auto_number 值的记录数: ${recordsWithAutoNumberCount.count}`);
    console.log(`  不包含 stock_in_auto_number 值的记录数: ${recordsWithoutAutoNumberCount.count}`);
    
    await db.close();
  } catch (error) {
    console.error('检查数据库时出错:', error);
  }
}

// 运行检查
checkDatabase();