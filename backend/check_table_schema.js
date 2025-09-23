const { executeQuery } = require('./config/database');

async function checkTableSchema() {
  try {
    // 初始化数据库
    const dbModule = require('./config/database');
    await dbModule.initDatabase();
    
    // 查询表结构
    const result = await executeQuery(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='inventory'"
    );
    
    console.log('Inventory表结构:');
    console.log('====================');
    if (result.success) {
      console.log(result.data[0].sql);
    } else {
      console.error('查询失败:', result.error);
    }
  } catch (error) {
    console.error('检查表结构时出错:', error);
  }
}

checkTableSchema();