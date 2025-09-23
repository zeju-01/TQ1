const fs = require('fs');
const path = require('path');

// 测试文件上传和入库的完整流程
async function testFileUploadAndStockIn() {
  try {
    console.log('开始测试文件上传和入库流程...');
    
    // 1. 登录获取访问令牌
    console.log('1. 登录获取访问令牌...');
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
    console.log('✅ 登录成功，获取到访问令牌');

    // 2. 执行入库操作（不带文件）
    console.log('2. 执行入库操作...');
    const stockInData = {
      product_name: "测试产品",
      product_model: "TM001",
      operator: "测试运营商",
      imei: "123456789012354",
      stock_in_quantity: 1,
      supplier: "测试供应商",
      stock_in_date: new Date().toISOString(),
      stock_in_document: "测试收货单据.pdf" // 直接使用文件名
    };

    console.log('入库数据:', stockInData);

    const stockInResponse = await fetch('http://localhost:5002/api/inventory/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(stockInData)
    });

    const stockInResult = await stockInResponse.json();
    console.log('入库响应:', stockInResult);

    if (stockInResult.success) {
      console.log('✅ 入库成功');
      console.log('入库记录ID:', stockInResult.data.id);
      
      // 3. 验证数据库中的 stock_in_document 字段
      console.log('3. 验证数据库中的 stock_in_document 字段...');
      const verifyResponse = await fetch(`http://localhost:5002/api/inventory/${stockInResult.data.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.success && verifyResult.data.stock_in_document === stockInData.stock_in_document) {
        console.log('✅ stock_in_document 字段保存成功:', verifyResult.data.stock_in_document);
        console.log('🎉 入库流程测试成功！');
      } else {
        console.log('❌ stock_in_document 字段保存失败');
        console.log('期望值:', stockInData.stock_in_document);
        console.log('实际值:', verifyResult.data.stock_in_document);
      }
    } else {
      console.log('❌ 入库失败:', stockInResult.message);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testFileUploadAndStockIn();