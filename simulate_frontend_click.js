const axios = require('axios');

// 设置基础URL
const BASE_URL = 'http://localhost:3000/api';

async function simulateFrontendClick() {
  try {
    console.log('模拟前端点击确认入库按钮...');
    
    // 1. 登录获取token
    console.log('1. 登录获取访问令牌...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'superadmin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ 登录成功');
    
    // 2. 模拟前端表单数据（完全按照前端StockInPage.tsx组件的格式）
    console.log('2. 准备前端表单数据...');
    const formData = {
      product_name: '前端测试产品',
      product_model: 'Frontend-Model-001',
      operator: '中国联通',
      imei: '111222333444555', // 使用新的IMEI号
      box_number: 'FRONT001', // 注意：前端使用box_number，后端使用batch_number
      quantity: 1, // 注意：前端使用quantity，后端使用stock_in_quantity
      supplier: '前端测试供应商',
      factory_order: 'FACTORY-FRONT-001',
      contract_number: 'CONTRACT-FRONT-001', // 注意：前端使用contract_number，后端使用stock_in_contract_number
      remark: '前端测试备注', // 注意：前端使用remark，后端使用stock_in_notes
      stock_in_number: 'SI202509258888',
      stock_in_date: '2025-09-25', // 注意：前端使用stock_in_date
      stock_in_document: '前端测试单据.pdf'
    };
    
    console.log('前端表单数据:', JSON.stringify(formData, null, 2));
    
    // 3. 模拟前端服务调用（按照frontend/src/services/inventory.ts中的stockIn函数）
    console.log('3. 调用前端服务...');
    
    // 转换前端数据为后端需要的格式（模拟前端service中的转换逻辑）
    const stockInData = {
      product_name: formData.product_name,
      product_model: formData.product_model,
      operator: formData.operator,
      imei: formData.imei,
      batch_number: formData.box_number, // 前端的box_number对应后端的batch_number
      stock_in_quantity: formData.quantity, // 前端的quantity对应后端的stock_in_quantity
      supplier: formData.supplier,
      factory_order: formData.factory_order,
      stock_in_contract_number: formData.contract_number, // 前端的contract_number对应后端的stock_in_contract_number
      stock_in_notes: formData.remark, // 前端的remark对应后端的stock_in_notes
      stock_in_number: formData.stock_in_number,
      stock_in_date: formData.stock_in_date,
      stock_in_document: formData.stock_in_document,
      stock_in_by: 'superadmin' // 从前端认证信息中获取
    };
    
    console.log('转换后的后端数据:', JSON.stringify(stockInData, null, 2));
    
    // 4. 调用入库接口
    console.log('4. 调用入库接口...');
    const stockInResponse = await axios.post(`${BASE_URL}/inventory/stock-in`, stockInData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ 入库响应:', JSON.stringify(stockInResponse.data, null, 2));
    
    if (stockInResponse.data.success) {
      console.log('🎉 入库成功！');
      console.log('入库记录ID:', stockInResponse.data.data.id);
    } else {
      console.log('❌ 入库失败:', stockInResponse.data.message);
    }
    
  } catch (error) {
    console.error('🚨 模拟前端点击过程中出错:');
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('请求信息:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

simulateFrontendClick();