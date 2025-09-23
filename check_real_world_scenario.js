// 检查真实场景下的问题
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkRealWorldScenario() {
  try {
    console.log('检查真实场景下的问题...\n');
    
    // 连接数据库
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 模拟真实的前端请求数据（可能包含 stock_in_auto_number）
    console.log('1. 模拟真实的前端请求数据...');
    const realWorldData = {
      product_name: '真实测试产品',
      product_model: 'REAL-MODEL',
      operator: '中国联通',
      imei: '777777777777777',
      batch_number: 'REAL-BATCH',
      stock_in_quantity: 2,
      supplier: '真实供应商',
      factory_order: 'REAL-WO-001',
      stock_in_date: '2025-09-22',
      stock_in_contract_number: 'REAL-CT-001',
      stock_in_document: '真实单据.pdf',
      stock_in_notes: '真实入库',
      stock_in_number: 'SI202509223333',
      // 前端可能传递的已废弃字段
      stock_in_auto_number: 'IN20250922001111'
    };
    
    console.log(`   请求数据中的 stock_in_auto_number: "${realWorldData.stock_in_auto_number}"`);
    
    // 模拟控制器的处理逻辑
    console.log('\n2. 模拟控制器处理逻辑...');
    const { stock_in_auto_number, ...filteredData } = realWorldData;
    const processedData = {
      ...filteredData,
      stock_in_by: 'real_test_user'
    };
    
    console.log(`   过滤后的数据是否包含 stock_in_auto_number: ${'stock_in_auto_number' in processedData}`);
    
    // 模拟模型处理逻辑
    console.log('\n3. 模拟模型处理逻辑...');
    const beijingTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    
    const query = `
      INSERT INTO inventory (
        product_name, product_model, operator, imei, batch_number,
        stock_in_quantity, supplier, factory_order, stock_in_date,
        stock_in_contract_number, stock_in_document, stock_in_notes,
        stock_in_number, stock_in_auto_number, stock_in_time, created_at,
        stock_in_status, return_status, after_sales_status, other_status,
        quantity, transaction_type, stock_in_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      processedData.product_name, processedData.product_model, processedData.operator, processedData.imei, processedData.batch_number,
      processedData.stock_in_quantity, processedData.supplier, processedData.factory_order, processedData.stock_in_date,
      processedData.stock_in_contract_number, processedData.stock_in_document, processedData.stock_in_notes,
      processedData.stock_in_number, 
      // 关键：这里应该显式传入 NULL，而不是忽略该字段
      null, 
      beijingTime, beijingTime,
      '已入库', '正常', '正常', '正常',
      processedData.stock_in_quantity, 'in', processedData.stock_in_by
    ];
    
    console.log(`   插入时的 stock_in_auto_number 值: ${params[13]}`);
    console.log(`   插入时的 stock_in_time 值: ${params[14]}`);
    
    const insertResult = await db.run(query, params);
    console.log(`   ✅ 插入成功，ID: ${insertResult.lastID}`);
    
    // 验证插入的记录
    console.log('\n4. 验证插入的记录...');
    const verifyQuery = `
      SELECT id, product_name, stock_in_auto_number, stock_in_number, stock_in_document, stock_in_time, created_at
      FROM inventory 
      WHERE id = ?
    `;
    
    const verifyResult = await db.get(verifyQuery, [insertResult.lastID]);
    console.log('   插入的记录详情:');
    console.log(`     ID: ${verifyResult.id}`);
    console.log(`     产品名称: ${verifyResult.product_name}`);
    console.log(`     stock_in_auto_number: ${verifyResult.stock_in_auto_number === null ? 'NULL' : `"${verifyResult.stock_in_auto_number}"`}`);
    console.log(`     stock_in_number: "${verifyResult.stock_in_number}"`);
    console.log(`     stock_in_document: "${verifyResult.stock_in_document}"`);
    console.log(`     stock_in_time: ${verifyResult.stock_in_time === null ? 'NULL' : `"${verifyResult.stock_in_time}"`}`);
    console.log(`     created_at: "${verifyResult.created_at}"`);
    
    // 检查问题
    console.log('\n5. 问题检查...');
    if (verifyResult.stock_in_auto_number === null) {
      console.log('   ✅ stock_in_auto_number 正确设置为 NULL');
    } else {
      console.log(`   ❌ stock_in_auto_number 仍有值: "${verifyResult.stock_in_auto_number}"`);
    }
    
    if (verifyResult.stock_in_time) {
      console.log(`   ✅ stock_in_time 正确填写: "${verifyResult.stock_in_time}"`);
    } else {
      console.log('   ❌ stock_in_time 未填写');
    }
    
    // 清理测试数据
    console.log('\n6. 清理测试数据...');
    await db.run("DELETE FROM inventory WHERE id = ?", [insertResult.lastID]);
    console.log('   ✅ 测试记录已删除');
    
    await db.close();
    console.log('\n✅ 真实场景检查完成！');
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  }
}

// 运行检查
checkRealWorldScenario();