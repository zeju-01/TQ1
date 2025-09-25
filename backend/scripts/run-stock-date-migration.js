// 执行入库和出库时间字段格式更新迁移的脚本

const migration = require('../migrations/update-stock-date-format');
const { initDatabase } = require('../config/database');

async function runMigration() {
  try {
    console.log('初始化数据库连接...');
    await initDatabase();
    
    console.log('执行数据库迁移...');
    const result = await migration.up();
    
    if (result) {
      console.log('数据库迁移执行成功！');
      process.exit(0);
    } else {
      console.error('数据库迁移执行失败！');
      process.exit(1);
    }
  } catch (error) {
    console.error('执行数据库迁移时发生错误:', error);
    process.exit(1);
  }
}

runMigration();