// 测试入库功能（包含身份验证）
const axios = require('axios');

async function testStockIn() {
  try {
    console.log('=== 测试入库功能（包含身份验证） ===');
    
    // 1. 先进行登录
    console.log('正在进行登录...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'password123'
    });
    
    console.log('登录成功');
    const token = loginResponse.data.data.token;
    console.log('获取到的令牌:', token);
    
    // 2. 准备入库数据
    const stockInData = {
      product_name: '测试产品',
      product_model: 'TEST-MODEL',
      operator: '中国移动',
      imei: '123456789012346', // 使用不同的IMEI
      batch_number: 'TEST002',
      stock_in_quantity: 1,
      supplier: '测试供应商',
      factory_order: 'FACTORY002',
      stock_in_date: '2025-09-25',
      stock_in_contract_number: 'CONTRACT002',
      stock_in_notes: '测试入库',
      stock_in_number: 'SI202509250002'
    };
    
    console.log('发送入库请求:', stockInData);
    
    // 3. 发送入库请求到后端（包含认证头）
    const response = await axios.post('http://localhost:3000/api/inventory/stock-in', stockInData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('入库响应:', response.data);
    
    if (response.data.success) {
      console.log('✅ 入库成功');
      
      // 检查返回的数据中的时间
      const inventory = response.data.data;
      console.log('返回的入库时间:', inventory.stock_in_time);
      console.log('返回的创建时间:', inventory.created_at);
      
      // 验证时间格式
      const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if (timeRegex.test(inventory.stock_in_time)) {
        console.log('✅ 入库时间格式正确');
      } else {
        console.log('❌ 入库时间格式错误');
      }
      
      if (timeRegex.test(inventory.created_at)) {
        console.log('✅ 创建时间格式正确');
      } else {
        console.log('❌ 创建时间格式错误');
      }
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