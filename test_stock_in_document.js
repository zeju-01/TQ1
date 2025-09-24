const fs = require('fs');
const path = require('path');

// 测试 stock_in_document 字段是否能正确保存到数据库
async function testStockInDocument() {
  try {
    // 先登录获取访问令牌
    const loginResponse = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('登录响应:', loginResult);

    if (!loginResult.success) {
      console.log('登录失败:', loginResult.message);
      return;
    }

    const accessToken = loginResult.data.accessToken;
    console.log('获取到访问令牌:', accessToken);

    // 模拟前端发送的数据
    const testData = {
      product_name: "测试产品",
      product_model: "TM001",
      operator: "测试运营商",
      imei: "123456789012350",
      stock_in_quantity: 1,
      supplier: "测试供应商",
      stock_in_date: new Date().toISOString(),
      stock_in_document: "测试收货单据.pdf"
    };

    console.log('测试数据:', testData);

    // 发送请求到后端
    const response = await fetch('http://localhost:5002/api/inventory/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('后端响应:', result);

    if (result.success) {
      console.log('✅ 入库成功');
      console.log('入库记录ID:', result.data.id);
      
      // 验证数据库中的 stock_in_document 字段
      const verifyResponse = await fetch(`http://localhost:5002/api/inventory/${result.data.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.success && verifyResult.data.stock_in_document === testData.stock_in_document) {
        console.log('✅ stock_in_document 字段保存成功:', verifyResult.data.stock_in_document);
      } else {
        console.log('❌ stock_in_document 字段保存失败');
        console.log('数据库中的值:', verifyResult.data.stock_in_document);
      }
    } else {
      console.log('❌ 入库失败:', result.message);
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testStockInDocument();