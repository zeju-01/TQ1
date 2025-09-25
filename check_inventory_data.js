const { executeQuery } = require('./backend/config/database');

async function checkInventoryData() {
  try {
    console.log('检查库存数据表中的记录数量...');
    
    // 查询库存表中的记录数量
    const countResult = await executeQuery('SELECT COUNT(*) as total FROM inventory');
    console.log('库存表总记录数:', countResult.data[0].total);
    
    // 查询最近的几条记录
    const recentResult = await executeQuery('SELECT id, product_name, imei, created_at FROM inventory ORDER BY id DESC LIMIT 5');
    console.log('最近的5条记录:');
    recentResult.data.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, 产品: ${record.product_name}, IMEI: ${record.imei}, 创建时间: ${record.created_at}`);
    });
    
    // 检查我们之前测试插入的记录是否存在
    const testRecordResult = await executeQuery("SELECT * FROM inventory WHERE product_name = 'API测试产品' AND imei = '987654321098766'");
    if (testRecordResult.data.length > 0) {
      console.log('找到了我们之前测试插入的记录:');
      console.log(testRecordResult.data[0]);
    } else {
      console.log('未找到我们之前测试插入的记录');
    }
    
  } catch (error) {
    console.error('检查过程中发生错误:', error);
  }
}

checkInventoryData();