const { executeQuery } = require('./config/database');

async function checkIMEI() {
  try {
    // 初始化数据库
    const dbModule = require('./config/database');
    await dbModule.initDatabase();
    
    // 查询所有IMEI号
    const result = await executeQuery(
      'SELECT id, imei, product_name, stock_in_number FROM inventory ORDER BY id DESC LIMIT 10'
    );
    
    console.log('最近的10条入库记录的IMEI信息:');
    console.log('=================================');
    if (result.success) {
      result.data.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id}`);
        console.log(`   IMEI: ${record.imei || '无'}`);
        console.log(`   产品: ${record.product_name || '无'}`);
        console.log(`   入库单号: ${record.stock_in_number || '无'}`);
        console.log('---------------------------------');
      });
    } else {
      console.error('查询失败:', result.error);
    }
  } catch (error) {
    console.error('检查IMEI时出错:', error);
  }
}

checkIMEI();