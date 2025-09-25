// 测试入库功能
const axios = require('axios');

async function testStockIn() {
  try {
    console.log('=== 测试入库功能 ===');
    
    // 准备入库数据
    const stockInData = {
      product_name: '测试产品',
      product_model: 'TEST-MODEL',
      operator: '中国移动',
      imei: '123456789012345',
      batch_number: 'TEST001',
      stock_in_quantity: 1,
      supplier: '测试供应商',
      factory_order: 'FACTORY001',
      stock_in_date: '2025-09-25',
      stock_in_contract_number: 'CONTRACT001',
      stock_in_notes: '测试入库',
      stock_in_number: 'SI202509250001'
    };
    
    console.log('发送入库请求:', stockInData);
    
    // 发送入库请求到后端
    const response = await axios.post('http://localhost:3000/api/inventory/stock-in', stockInData);
    
    console.log('入库响应:', response.data);
    
    if (response.data.success) {
      console.log('✅ 入库成功');
      
      // 检查返回的数据中的时间
      const inventory = response.data.data;
      console.log('返回的入库时间:', inventory.stock_in_time);
      console.log('返回的创建时间:', inventory.created_at);
    } else {
      console.log('❌ 入库失败:', response.data.message);
    }
    
    console.log('=== 测试完成 ===');
  } catch (error) {
    console.error('测试过程中出错:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
  }
}

// 运行测试
testStockIn();