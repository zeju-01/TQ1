const axios = require('axios');

// 设置基础URL
const BASE_URL = 'http://localhost:3000/api';

async function testFrontendSubmit() {
  try {
    console.log('开始测试前端确认按钮提交...');
    
    // 1. 登录获取token
    console.log('1. 登录获取访问令牌...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'superadmin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('登录成功，获取到令牌:', token.substring(0, 20) + '...');
    
    // 2. 模拟前端单个入库提交的数据
    console.log('2. 准备模拟前端提交的入库数据...');
    const stockInData = {
      product_name: '5G模组',
      product_model: 'RG500Q-EA',
      operator: '中国移动',
      imei: '555556789012345', // 使用一个新的IMEI号
      batch_number: 'BOX001',
      stock_in_quantity: 1,
      supplier: '测试供应商',
      factory_order: 'FACTORY001',
      stock_in_contract_number: 'CONTRACT001',
      stock_in_notes: '测试备注',
      stock_in_number: 'SI202509250002',
      stock_in_date: '2025-09-25',
      stock_in_document: '测试单据1.pdf'
    };
    
    console.log('提交数据:', stockInData);
    
    // 3. 调用入库接口
    console.log('3. 调用入库接口...');
    const stockInResponse = await axios.post(`${BASE_URL}/inventory/stock-in`, stockInData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('入库响应:', stockInResponse.data);
    
    if (stockInResponse.data.success) {
      console.log('✅ 入库成功！');
      console.log('入库记录ID:', stockInResponse.data.data.id);
    } else {
      console.log('❌ 入库失败:', stockInResponse.data.message);
    }
    
  } catch (error) {
    console.error('测试过程中出错:');
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求信息:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

testFrontendSubmit();