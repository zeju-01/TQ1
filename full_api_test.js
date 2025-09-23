// 完整API测试脚本（包括认证）
const axios = require('axios');
const path = require('path');

// 模拟完整的API调用流程，包括认证
async function fullApiTest() {
  try {
    console.log('=== 完整API测试（包括认证） ===\n');
    
    const baseURL = 'http://localhost:5001';
    console.log('API基础URL:', baseURL);
    
    // 创建axios实例
    const api = axios.create({
      baseURL: baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 1. 登录获取认证令牌
    console.log('1. 登录获取认证令牌:');
    try {
      const loginResponse = await api.post('/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      
      console.log('登录成功');
      console.log('访问令牌:', loginResponse.data.data.accessToken);
      
      // 设置认证头
      api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.data.accessToken}`;
      
      // 2. 准备测试数据
      console.log('\n2. 准备测试数据:');
      const testData = {
        product_id: 1,
        product_name: "完整测试产品",
        product_model: "测试型号002",
        product_description: "完整测试产品描述",
        operator: "中国联通",
        imei: "777777777777777",
        batch_number: "TEST_BATCH_003",
        stock_in_quantity: 1,
        supplier: "完整测试供应商",
        factory_name: "完整测试工厂",
        factory_order: "FACTORY_ORDER_003",
        stock_in_date: "2025-09-22",
        stock_in_contract_number: "CONTRACT_003",
        stock_in_document: "完整测试单据.pdf",
        stock_in_notes: "完整测试备注",
        stock_in_number: "SI202509220004"
        // 注意：不包含 stock_in_auto_number 字段
      };
      
      console.log('发送的数据:');
      console.log(JSON.stringify(testData, null, 2));
      
      // 3. 调用入库API
      console.log('\n3. 调用入库API:');
      const stockInResponse = await api.post('/api/inventory/stock-in', testData);
      console.log('入库响应状态:', stockInResponse.status);
      console.log('入库响应数据:', JSON.stringify(stockInResponse.data, null, 2));
      
      // 4. 检查数据库中的实际记录
      console.log('\n4. 检查数据库中的实际记录:');
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
      
    } catch (authError) {
      console.log('认证或API调用错误:');
      if (authError.response) {
        console.log('  状态码:', authError.response.status);
        console.log('  响应数据:', JSON.stringify(authError.response.data, null, 2));
      } else {
        console.log('  错误信息:', authError.message);
      }
    }
    
    console.log('\n✅ 完整API测试完成！');
    
  } catch (error) {
    console.error('完整API测试过程中出错:', error);
  }
}

// 运行测试
fullApiTest();