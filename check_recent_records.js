// 检查最近的库存记录
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkRecentRecords() {
  try {
    console.log('检查最近的库存记录...\n');
    
    // 连接数据库
    const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 获取最近10条记录
    const records = await db.all('SELECT id, product_name, imei, stock_in_time, stock_in_auto_number, created_at FROM inventory ORDER BY id DESC LIMIT 10');
    console.log('最近10条记录:');
    records.forEach((row, index) => {
      console.log(`${index+1}. ID: ${row.id}, 产品: ${row.product_name}, IMEI: ${row.imei}`);
      console.log(`   stock_in_time: ${row.stock_in_time === null ? 'NULL' : '"' + row.stock_in_time + '"'}`);
      console.log(`   stock_in_auto_number: ${row.stock_in_auto_number === null ? 'NULL' : '"' + row.stock_in_auto_number + '"'}`);
      console.log(`   created_at: ${row.created_at}`);
      console.log('');
    });
    
    await db.close();
    console.log('✅ 记录检查完成！');
    
  } catch (error) {
    console.error('检查记录时出错:', error);
  }
}

// 运行检查
checkRecentRecords();