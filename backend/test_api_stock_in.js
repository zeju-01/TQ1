const express = require('express');
const InventoryController = require('./controllers/InventoryController');

// 创建一个测试服务器来模拟API调用
const app = express();
app.use(express.json());

// 模拟认证中间件
app.use((req, res, next) => {
  req.user = { username: 'test_user' };
  next();
});

// 模拟路由
app.post('/api/inventory/stock-in', InventoryController.stockIn);

// 启动测试服务器
const PORT = 0;
const server = app.listen(PORT, () => {
  console.log(`测试服务器运行在端口 ${PORT}`);
  
  // 立即执行测试
  runAPITest();
});

async function runAPITest() {
  try {
    console.log('=== 开始API测试 ===\n');
    
    // 模拟前端发送的请求数据
    const testData = {
      product_name: 'API测试产品',
      product_model: 'API-TEST-MODEL-001',
      operator: '测试运营商',
      imei: '666666666666666',
      batch_number: 'API-BOX001',
      stock_in_quantity: 5,
      supplier: 'API测试供应商',
      factory_order: 'API-FACTORY001',
      stock_in_contract_number: 'API-CONTRACT001',
      stock_in_notes: 'API测试入库备注',
      stock_in_number: 'SI202509230005',
      stock_in_date: '2025-09-23 12:30:00',
      stock_in_document: 'SI202509230005_1.pdf'
    };
    
    console.log('发送测试数据到API:', testData);
    
    // 发送请求到测试服务器
    const response = await fetch(`http://localhost:${PORT}/api/inventory/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('\nAPI响应状态:', response.status);
    console.log('API响应数据:', result);
    
    if (result.success) {
      console.log('\n=== 测试结果 ===');
      console.log('✓ API测试通过');
      console.log('✓ 入库成功，记录ID:', result.data.id);
      console.log('✓ stock_in_document 字段值:', result.data.stock_in_document);
      
      // 验证数据库中的值
      if (result.data.stock_in_document === testData.stock_in_document) {
        console.log('✓ 数据库中正确保存了 stock_in_document 字段');
      } else {
        console.log('✗ 数据库中 stock_in_document 字段值不正确');
        console.log('  期望值:', testData.stock_in_document);
        console.log('  实际值:', result.data.stock_in_document);
      }
    } else {
      console.log('\n=== 测试结果 ===');
      console.log('✗ API测试失败:', result.message);
    }
    
  } catch (error) {
    console.error('API测试出错:', error);
  } finally {
    // 关闭服务器
    server.close(() => {
      console.log('\n测试服务器已关闭');
    });
  }
}