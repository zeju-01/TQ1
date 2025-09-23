// 综合调试测试脚本
const axios = require('axios');
const path = require('path');

// 模拟完整的API调用流程
async function comprehensiveDebugTest() {
  try {
    console.log('=== 综合调试测试 ===\n');
    
    // 1. 准备测试数据
    console.log('1. 准备测试数据:');
    const testData = {
      product_id: 1,
      product_name: "综合测试产品",
      product_model: "测试型号001",
      product_description: "综合测试产品描述",
      operator: "中国移动",
      imei: "888888888888888",
      batch_number: "TEST_BATCH_002",
      stock_in_quantity: 1,
      supplier: "综合测试供应商",
      factory_name: "综合测试工厂",
      factory_order: "FACTORY_ORDER_002",
      stock_in_date: "2025-09-22",
      stock_in_contract_number: "CONTRACT_002",
      stock_in_document: "综合测试单据2.pdf",
      stock_in_notes: "综合测试备注2",
      stock_in_number: "SI202509220003"
      // 注意：不包含 stock_in_auto_number 字段
    };
    
    console.log('发送的数据:');
    console.log(JSON.stringify(testData, null, 2));
    
    // 2. 直接调用后端API（绕过前端）
    console.log('\n2. 直接调用后端API:');
    
    // 使用正确的API端点
    const baseURL = 'http://localhost:5001'; // 后端服务端口
    console.log('API基础URL:', baseURL);
    
    // 创建axios实例
    const api = axios.create({
      baseURL: baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    try {
      // 发送POST请求到正确的端点
      console.log('\n发送POST请求到 /api/inventory/stock-in');
      const response = await api.post('/api/inventory/stock-in', testData);
      console.log('响应状态:', response.status);
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
    } catch (apiError) {
      console.log('API调用错误:');
      if (apiError.response) {
        console.log('  状态码:', apiError.response.status);
        console.log('  响应数据:', JSON.stringify(apiError.response.data, null, 2));
        console.log('  响应头:', apiError.response.headers);
      } else if (apiError.request) {
        console.log('  请求信息:', apiError.request);
      } else {
        console.log('  错误信息:', apiError.message);
      }
    }
    
    // 3. 检查数据库中的实际记录
    console.log('\n3. 检查数据库中的实际记录:');
    const { open } = require('sqlite');
    const sqlite3 = require('sqlite3').verbose();
    
    const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 查询最新插入的记录
    const latestRecord = await db.get(`
      SELECT * FROM inventory 
      WHERE imei = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [testData.imei]);
    
    if (latestRecord) {
      console.log('最新插入的记录:');
      console.log(`  ID: ${latestRecord.id}`);
      console.log(`  IMEI: ${latestRecord.imei}`);
      console.log(`  产品名称: ${latestRecord.product_name}`);
      console.log(`  stock_in_time: ${latestRecord.stock_in_time}`);
      console.log(`  stock_in_auto_number: ${latestRecord.stock_in_auto_number}`);
      console.log(`  stock_in_document: ${latestRecord.stock_in_document}`);
      console.log(`  created_at: ${latestRecord.created_at}`);
    } else {
      console.log('未找到相关记录');
    }
    
    await db.close();
    
    console.log('\n✅ 综合调试测试完成！');
    
  } catch (error) {
    console.error('综合调试测试过程中出错:', error);
  }
}

// 运行测试
comprehensiveDebugTest();