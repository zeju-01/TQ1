const axios = require('axios');
const path = require('path');
const fs = require('fs');

// 设置基础URL
const BASE_URL = 'http://localhost:3000/api';

async function testFullStockIn() {
  try {
    console.log('开始测试完整的入库流程...');
    
    // 1. 登录获取token（使用默认管理员账户）
    console.log('1. 登录获取访问令牌...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'superadmin',
      password: 'admin123'
    });
    
    console.log('登录响应状态:', loginResponse.status);
    
    if (!loginResponse || !loginResponse.data) {
      console.error('❌ 登录响应无效');
      return;
    }
    
    if (!loginResponse.data.success) {
      console.error('❌ 登录失败:', loginResponse.data.message);
      return;
    }
    
    // 注意：访问令牌字段名是 accessToken 而不是 token
    const token = loginResponse.data.data.accessToken;
    console.log('登录成功，获取到令牌:', token.substring(0, 20) + '...');
    
    // 2. 准备入库数据
    console.log('2. 准备入库数据...');
    const stockInData = {
      product_name: '测试产品',
      product_model: '测试型号',
      operator: '中国移动',
      imei: '987654321012345',
      batch_number: 'TEST002',
      stock_in_quantity: 1,
      supplier: '测试供应商',
      factory_order: 'FACTORY002',
      stock_in_contract_number: 'CONTRACT002',
      stock_in_notes: '测试备注',
      stock_in_number: 'SI202509250001',
      stock_in_date: '2025-09-25',
      stock_in_document: '测试单据2.pdf'
    };
    
    console.log('入库数据:', stockInData);
    
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

testFullStockIn();