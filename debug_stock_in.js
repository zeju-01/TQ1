const axios = require('axios');

// 设置基础URL
const BASE_URL = 'http://localhost:3000/api';

async function debugStockIn() {
  try {
    console.log('开始调试入库流程...');
    
    // 1. 登录获取token
    console.log('1. 登录获取访问令牌...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'superadmin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ 登录成功，获取到令牌');
    
    // 2. 准备入库数据（模拟前端表单数据）
    console.log('2. 准备入库数据...');
    const stockInData = {
      product_name: '调试测试产品',
      product_model: 'Test-Model-001',
      operator: '中国移动',
      imei: '999888777666555', // 使用新的IMEI号
      batch_number: 'DEBUG001',
      stock_in_quantity: 1,
      supplier: '调试供应商',
      factory_order: 'FACTORY-DEBUG-001',
      stock_in_contract_number: 'CONTRACT-DEBUG-001',
      stock_in_notes: '调试测试备注',
      stock_in_number: 'SI202509259999',
      stock_in_date: '2025-09-25',
      stock_in_document: '调试测试单据.pdf'
    };
    
    console.log('准备提交的数据:', JSON.stringify(stockInData, null, 2));
    
    // 3. 调用入库接口
    console.log('3. 调用入库接口...');
    const stockInResponse = await axios.post(`${BASE_URL}/inventory/stock-in`, stockInData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 设置10秒超时
    });
    
    console.log('✅ 入库响应:', JSON.stringify(stockInResponse.data, null, 2));
    
    if (stockInResponse.data.success) {
      console.log('🎉 入库成功！');
      console.log('入库记录ID:', stockInResponse.data.data.id);
    } else {
      console.log('❌ 入库失败:', stockInResponse.data.message);
    }
    
  } catch (error) {
    console.error('🚨 测试过程中出错:');
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('请求信息:', error.request);
      console.error('请求配置:', JSON.stringify(error.config, null, 2));
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

debugStockIn();