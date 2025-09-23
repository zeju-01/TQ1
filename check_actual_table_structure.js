// 检查实际的表结构
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkActualTableStructure() {
  try {
    console.log('检查实际的表结构...\n');
    
    // 连接数据库
    const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 获取表的创建语句
    const result = await db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='inventory'");
    console.log('表的创建语句:');
    console.log(result[0].sql);
    
    // 检查 stock_in_auto_number 字段的约束
    const tableInfo = await db.all("PRAGMA table_info(inventory)");
    const autoNumberField = tableInfo.find(field => field.name === 'stock_in_auto_number');
    console.log('\nstock_in_auto_number 字段信息:');
    console.log(`  名称: ${autoNumberField.name}`);
    console.log(`  类型: ${autoNumberField.type}`);
    console.log(`  是否非空: ${autoNumberField.notnull ? '是' : '否'}`);
    console.log(`  默认值: ${autoNumberField.dflt_value}`);
    console.log(`  是否为主键: ${autoNumberField.pk ? '是' : '否'}`);
    
    await db.close();
    console.log('\n✅ 表结构检查完成！');
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  }
}

// 运行检查
checkActualTableStructure();