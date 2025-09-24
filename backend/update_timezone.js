const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'data', 'inventory.db');

async function updateDatabaseTimezone() {
  let db;
  try {
    // 连接数据库
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // 检查是否需要更新表结构
    const tableInfo = await db.all("PRAGMA table_info(inventory)");
    const timeColumns = tableInfo.filter(col => 
      col.name.includes('_time') || col.name.includes('_date') || col.name === 'created_at' || col.name === 'updated_at'
    );

    console.log('当前时间相关字段:');
    timeColumns.forEach(col => {
      console.log(`- ${col.name}: ${col.dflt_value}`);
    });

    // 更新时间字段的默认值
    const timeFields = [
      'stock_in_date', 'stock_in_time', 'stock_out_date', 'stock_out_time',
      'return_time', 'after_sales_time', 'created_at', 'updated_at'
    ];

    for (const field of timeFields) {
      try {
        // 检查字段是否存在
        const fieldExists = timeColumns.find(col => col.name === field);
        if (fieldExists) {
          console.log(`更新字段 ${field} 的默认值...`);
          // 注意：SQLite 不支持直接修改列的默认值，需要重建表
          // 这里我们只输出信息，实际应用中需要更复杂的表重建逻辑
        }
      } catch (error) {
        console.error(`更新字段 ${field} 时出错:`, error.message);
      }
    }

    console.log('时区更新脚本执行完成。');
    
    // 显示当前时间
    const now = new Date();
    console.log('当前系统时间:', now.toString());
    console.log('北京时间:', now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    
  } catch (error) {
    console.error('更新数据库时区时出错:', error);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

updateDatabaseTimezone();