// 检查库存表结构
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkTableSchema() {
  try {
    console.log('检查库存表结构...\n');
    
    // 连接数据库
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 获取表结构信息
    const tableInfo = await db.all("PRAGMA table_info(inventory)");
    console.log('库存表字段信息:');
    tableInfo.forEach(field => {
      console.log(`  ${field.name} (${field.type}) ${field.notnull ? 'NOT NULL' : 'NULL'} ${field.dflt_value ? `默认值: ${field.dflt_value}` : ''} ${field.pk ? '主键' : ''}`);
    });
    
    // 特别检查 stock_in_auto_number 字段
    console.log('\n特别检查 stock_in_auto_number 字段:');
    const autoNumberField = tableInfo.find(field => field.name === 'stock_in_auto_number');
    if (autoNumberField) {
      console.log(`  字段名: ${autoNumberField.name}`);
      console.log(`  数据类型: ${autoNumberField.type}`);
      console.log(`  是否非空: ${autoNumberField.notnull ? '是' : '否'}`);
      console.log(`  默认值: ${autoNumberField.dflt_value || '无'}`);
      console.log(`  是否主键: ${autoNumberField.pk ? '是' : '否'}`);
      
      if (autoNumberField.notnull && !autoNumberField.dflt_value) {
        console.log('  ⚠️  该字段有 NOT NULL 约束但无默认值');
        console.log('  这意味着插入记录时必须提供该字段的值');
      }
    } else {
      console.log('  ❌ 未找到 stock_in_auto_number 字段');
    }
    
    await db.close();
    console.log('\n✅ 表结构检查完成！');
    
  } catch (error) {
    console.error('检查表结构时出错:', error);
  }
}

// 运行检查
checkTableSchema();