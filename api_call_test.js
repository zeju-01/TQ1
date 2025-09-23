// API调用测试：模拟实际的HTTP请求
const axios = require('axios');
const fs = require('fs');

async function runApiCallTest() {
  try {
    console.log('=== API调用测试 ===\n');
    
    // 1. 先登录获取访问令牌
    console.log('1. 登录获取访问令牌...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      username: 'superadmin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('登录响应状态码:', loginResponse.status);
    const accessToken = loginResponse.data.data.accessToken;
    console.log('获取到的访问令牌:', accessToken.substring(0, 20) + '...');
    
    // 2. 准备测试数据（使用正确的15位IMEI号）
    const testData = {
      product_name: 'API测试产品',
      product_model: 'API测试型号',
      imei: '123456789012345', // 正确的15位IMEI号
      stock_in_quantity: 1,
      supplier: 'API测试供应商',
      factory_order: 'API_TEST_ORDER',
      stock_in_date: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      stock_in_contract_number: 'API_TEST_CONTRACT',
      stock_in_document: 'API测试收货单据.xlsx',
      stock_in_notes: 'API测试备注'
    };
    
    console.log('\n2. 发送测试数据:', JSON.stringify(testData, null, 2));
    
    // 3. 发送POST请求到入库接口
    console.log('\n3. 发送POST请求到 /api/inventory/stock-in...');
    const response = await axios.post('http://localhost:5001/api/inventory/stock-in', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('响应状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    // 4. 检查数据库中的记录
    console.log('\n4. 检查数据库中的记录...');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./backend/data/inventory.db');
    
    // 查找最新插入的记录
    const getRecord = new Promise((resolve, reject) => {
      db.get('SELECT * FROM inventory ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    const row = await getRecord;
    console.log('数据库记录:');
    console.log('  ID:', row.id);
    console.log('  IMEI:', row.imei);
    console.log('  stock_in_time:', row.stock_in_time === null ? 'NULL' : row.stock_in_time);
    console.log('  stock_in_auto_number:', row.stock_in_auto_number === null ? 'NULL' : row.stock_in_auto_number);
    console.log('  stock_in_document:', row.stock_in_document);
    console.log('  created_at:', row.created_at);
    
    // 5. 清理测试数据
    console.log('\n5. 清理测试数据...');
    const deleteRecord = new Promise((resolve, reject) => {
      db.run('DELETE FROM inventory WHERE id = ?', [row.id], (deleteErr) => {
        if (deleteErr) {
          reject(deleteErr);
        } else {
          resolve();
        }
      });
    });
    
    await deleteRecord;
    console.log('测试记录已清理');
    
    db.close();
    console.log('\n=== API调用测试完成 ===');
    
  } catch (error) {
    console.error('API调用测试过程中出错:', error.response ? error.response.data : error.message);
  }
}

// 运行测试
runApiCallTest();