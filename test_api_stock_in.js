const axios = require('axios');

async function testAPIStockIn() {
  try {
    console.log('开始测试API入库功能...');
    
    // 首先登录获取token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('登录响应:', loginResponse.data);
    
    // 根据实际响应结构调整token获取方式
    const token = loginResponse.data.data.accessToken || loginResponse.data.data.token || loginResponse.data.accessToken || loginResponse.data.token;
    console.log('提取到的token:', token);
    
    // 测试入库API
    const stockInData = {
      product_name: "API测试产品",
      product_model: "API测试型号",
      operator: "中国联通",
      imei: "987654321098766",
      batch_number: "API001",
      stock_in_quantity: 2,
      supplier: "API测试供应商",
      factory_order: "APIFACTORY001",
      stock_in_contract_number: "APICONTRACT001",
      stock_in_notes: "API测试备注",
      stock_in_number: "SI202509250002",
      stock_in_date: "2025-09-25",
      stock_in_document: "API收货单据.pdf"
    };
    
    console.log('发送入库请求数据:', stockInData);
    
    const stockInResponse = await axios.post('http://localhost:3001/api/inventory/stock-in', stockInData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('入库响应:', stockInResponse.data);
    
    if (stockInResponse.data.success) {
      console.log('API入库测试成功！');
    } else {
      console.error('API入库测试失败:', stockInResponse.data.message);
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error.response ? error.response.data : error.message);
  }
}

testAPIStockIn();