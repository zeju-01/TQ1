// 检查数据库中的时间数据
const { executeQuery } = require('./config/database');

async function checkDbTime() {
  try {
    // 初始化数据库连接
    const { initDatabase } = require('./config/database');
    await initDatabase();
    
    console.log('=== 检查数据库中的时间数据 ===');
    
    // 查询最新的几条记录
    const query = `
      SELECT id, product_name, stock_in_time, created_at 
      FROM inventory 
      ORDER BY id DESC 
      LIMIT 5
    `;
    
    const result = await executeQuery(query);
    
    if (result.success) {
      console.log('最新的库存记录:');
      result.data.forEach(record => {
        console.log(`  ID: ${record.id}`);
        console.log(`    产品名称: ${record.product_name}`);
        console.log(`    入库时间: ${record.stock_in_time}`);
        console.log(`    创建时间: ${record.created_at}`);
        console.log();
      });
    } else {
      console.error('查询失败:', result.error);
    }
    
    console.log('=== 检查完成 ===');
  } catch (error) {
    console.error('检查过程中出错:', error);
  }
}

// 运行检查
checkDbTime();