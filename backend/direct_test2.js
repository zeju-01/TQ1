// 直接测试库存模型的时间处理
const InventoryModel = require('./models/Inventory');
const { initDatabase } = require('./config/database');

async function directTest() {
  try {
    console.log('=== 直接测试库存模型的时间处理 ===');
    
    // 初始化数据库
    await initDatabase();
    
    // 准备测试数据
    const testData = {
      product_name: '直接测试产品',
      product_model: 'DIRECT-TEST',
      operator: '中国联通',
      imei: '555555555555555', // 使用唯一的IMEI
      batch_number: 'DIRECT001',
      stock_in_quantity: 1,
      supplier: '直接测试供应商',
      factory_order: 'DIRECT-FACTORY001',
      stock_in_date: '2025-09-25',
      stock_in_contract_number: 'DIRECT-CONTRACT001',
      stock_in_notes: '直接测试入库',
      stock_in_number: 'SI202509250003'
    };
    
    console.log('测试数据:', testData);
    
    // 调用库存模型的入库方法
    console.log('调用库存模型的入库方法...');
    const result = await InventoryModel.createStockIn(testData);
    
    console.log('入库结果:', result);
    
    if (result) {
      console.log('✅ 入库成功');
      console.log('入库时间:', result.stock_in_time);
      console.log('创建时间:', result.created_at);
      
      // 验证时间格式
      const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if (timeRegex.test(result.stock_in_time)) {
        console.log('✅ 入库时间格式正确');
      } else {
        console.log('❌ 入库时间格式错误');
      }
      
      // 检查时间是否为北京时间
      const currentTime = new Date();
      const currentHour = currentTime.getUTCHours();
      const beijingHour = (currentHour + 8) % 24;
      
      // 解析入库时间
      const stockInTimeParts = result.stock_in_time.split(' ');
      const timeParts = stockInTimeParts[1].split(':');
      const stockInHour = parseInt(timeParts[0]);
      
      console.log(`当前UTC小时: ${currentHour}, 北京小时: ${beijingHour}, 入库小时: ${stockInHour}`);
      
      // 检查时间是否合理（应该接近当前北京时间）
      if (Math.abs(stockInHour - beijingHour) <= 1) {
        console.log('✅ 入库时间与时区一致');
      } else {
        console.log('❌ 入库时间与时区不一致');
      }
    } else {
      console.log('❌ 入库失败');
    }
    
    console.log('=== 测试完成 ===');
  } catch (error) {
    console.error('测试过程中出错:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
directTest();