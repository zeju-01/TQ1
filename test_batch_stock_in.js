// 测试批量入库功能
const axios = require('axios');

async function runBatchStockInTest() {
  try {
    console.log('=== 批量入库测试 ===\n');
    
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
    
    // 2. 准备批量测试数据
    const batchData = [
      {
        product_name: '批量测试产品1',
        product_model: '批量测试型号1',
        imei: '123456789012341',
        quantity: 1,
        supplier: '批量测试供应商1',
        factory_order: 'BATCH_TEST_ORDER1',
        stock_in_date: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        contract_number: 'BATCH_TEST_CONTRACT1',
        stock_in_document: '批量测试收货单据1.xlsx',
        remark: '批量测试备注1',
        stock_in_number: 'SI202509220001'
      },
      {
        product_name: '批量测试产品2',
        product_model: '批量测试型号2',
        imei: '123456789012342',
        quantity: 2,
        supplier: '批量测试供应商2',
        factory_order: 'BATCH_TEST_ORDER2',
        stock_in_date: new Date().toISOString(), // 使用ISO格式测试
        contract_number: 'BATCH_TEST_CONTRACT2',
        stock_in_document: '批量测试收货单据2.xlsx',
        remark: '批量测试备注2',
        stock_in_number: 'SI202509220002'
      }
    ];
    
    console.log('\n2. 发送批量测试数据:', JSON.stringify(batchData, null, 2));
    
    // 3. 发送POST请求到批量入库接口
    console.log('\n3. 发送POST请求到 /api/inventory/stock-in/batch...');
    const response = await axios.post('http://localhost:5001/api/inventory/stock-in/batch', 
      { stockInList: batchData },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    console.log('响应状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    // 4. 检查数据库中的记录
    console.log('\n4. 检查数据库中的记录...');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./backend/data/inventory.db');
    
    // 查找最新插入的记录
    const getRecords = new Promise((resolve, reject) => {
      db.all('SELECT * FROM inventory ORDER BY id DESC LIMIT 2', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    const rows = await getRecords;
    console.log('数据库记录:');
    rows.forEach((row, index) => {
      console.log(`  记录 ${index + 1}:`);
      console.log('    ID:', row.id);
      console.log('    IMEI:', row.imei);
      console.log('    stock_in_time:', row.stock_in_time === null ? 'NULL' : row.stock_in_time);
      console.log('    stock_in_auto_number:', row.stock_in_auto_number === null ? 'NULL' : row.stock_in_auto_number);
      console.log('    stock_in_document:', row.stock_in_document);
      console.log('    stock_in_date:', row.stock_in_date);
      console.log('    created_at:', row.created_at);
    });
    
    // 5. 清理测试数据
    console.log('\n5. 清理测试数据...');
    const deleteRecords = new Promise((resolve, reject) => {
      const ids = rows.map(row => row.id);
      const placeholders = ids.map(() => '?').join(',');
      const query = `DELETE FROM inventory WHERE id IN (${placeholders})`;
      db.run(query, ids, (deleteErr) => {
        if (deleteErr) {
          reject(deleteErr);
        } else {
          resolve();
        }
      });
    });
    
    await deleteRecords;
    console.log('测试记录已清理');
    
    db.close();
    console.log('\n=== 批量入库测试完成 ===');
    
  } catch (error) {
    console.error('批量入库测试过程中出错:', error.response ? error.response.data : error.message);
  }
}

// 运行测试
runBatchStockInTest();