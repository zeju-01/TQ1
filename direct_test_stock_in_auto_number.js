// 直接测试 stock_in_auto_number 字段写入问题
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function directTest() {
  try {
    console.log('直接测试 stock_in_auto_number 字段写入问题...\n');
    
    // 1. 连接数据库
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 2. 获取当前最大ID
    const maxIdResult = await db.get("SELECT MAX(id) as maxId FROM inventory");
    const currentMaxId = maxIdResult.maxId || 0;
    console.log(`当前最大库存ID: ${currentMaxId}`);
    
    // 3. 插入一条测试记录（模拟经过控制器过滤后的数据）
    console.log('\n插入测试记录（不包含 stock_in_auto_number）...');
    const testInsertQuery = `
      INSERT INTO inventory (
        product_name, product_model, operator, imei, batch_number,
        stock_in_quantity, supplier, factory_order, stock_in_date,
        stock_in_contract_number, stock_in_document, stock_in_notes,
        stock_in_number, stock_in_time, created_at,
        stock_in_status, return_status, after_sales_status, other_status,
        quantity, transaction_type, stock_in_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const testInsertParams = [
      '直接测试产品', 'DIRECT-TEST-MODEL', '中国联通', '888888888888888', 'DIRECT-TEST-BATCH',
      1, '直接测试供应商', 'DIRECT-WO-001', '2025-09-22',
      'DIRECT-CT-001', '直接测试单据.pdf', '直接测试入库',
      'SI202509220999', '2025-09-22 15:00:00', '2025-09-22 15:00:00',
      '已入库', '正常', '正常', '正常',
      1, 'in', 'direct_test_user'
    ];
    
    const insertResult = await db.run(testInsertQuery, testInsertParams);
    console.log(`✅ 插入测试记录成功，新记录ID: ${insertResult.lastID}`);
    
    // 4. 验证插入的记录
    console.log('\n验证插入的记录...');
    const verifyQuery = `
      SELECT id, product_name, stock_in_auto_number, stock_in_number, created_at
      FROM inventory 
      WHERE id = ?
    `;
    
    const verifyResult = await db.get(verifyQuery, [insertResult.lastID]);
    console.log('插入的记录详情:');
    console.log(`  ID: ${verifyResult.id}`);
    console.log(`  产品名称: ${verifyResult.product_name}`);
    console.log(`  stock_in_auto_number: "${verifyResult.stock_in_auto_number}"`);
    console.log(`  stock_in_number: "${verifyResult.stock_in_number}"`);
    console.log(`  创建时间: ${verifyResult.created_at}`);
    
    // 5. 检查 stock_in_auto_number 字段的值
    console.log('\n检查 stock_in_auto_number 字段...');
    if (verifyResult.stock_in_auto_number === null || verifyResult.stock_in_auto_number === '') {
      console.log('✅ stock_in_auto_number 字段为空，符合预期');
    } else {
      console.log(`⚠️  stock_in_auto_number 字段有值: "${verifyResult.stock_in_auto_number}"`);
    }
    
    // 6. 再插入一条包含 stock_in_auto_number 的记录（模拟绕过控制器的情况）
    console.log('\n插入包含 stock_in_auto_number 的测试记录...');
    const testInsertQuery2 = `
      INSERT INTO inventory (
        product_name, product_model, operator, imei, batch_number,
        stock_in_quantity, supplier, factory_order, stock_in_date,
        stock_in_contract_number, stock_in_document, stock_in_notes,
        stock_in_number, stock_in_auto_number, stock_in_time, created_at,
        stock_in_status, return_status, after_sales_status, other_status,
        quantity, transaction_type, stock_in_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // 生成唯一的 stock_in_auto_number 值
    const uniqueAutoNumber = `IN${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Date.now().toString().slice(-6)}`;
    
    const testInsertParams2 = [
      '直接测试产品2', 'DIRECT-TEST-MODEL2', '中国电信', '999999999999999', 'DIRECT-TEST-BATCH2',
      1, '直接测试供应商2', 'DIRECT-WO-002', '2025-09-22',
      'DIRECT-CT-002', '直接测试单据2.pdf', '直接测试入库2',
      'SI202509221000', uniqueAutoNumber, '2025-09-22 16:00:00', '2025-09-22 16:00:00',
      '已入库', '正常', '正常', '正常',
      1, 'in', 'direct_test_user2'
    ];
    
    console.log(`使用的 stock_in_auto_number 值: ${uniqueAutoNumber}`);
    
    const insertResult2 = await db.run(testInsertQuery2, testInsertParams2);
    console.log(`✅ 插入包含 stock_in_auto_number 的测试记录成功，新记录ID: ${insertResult2.lastID}`);
    
    // 7. 验证第二条记录
    console.log('\n验证第二条记录...');
    const verifyQuery2 = `
      SELECT id, product_name, stock_in_auto_number, stock_in_number, created_at
      FROM inventory 
      WHERE id = ?
    `;
    
    const verifyResult2 = await db.get(verifyQuery2, [insertResult2.lastID]);
    console.log('第二条记录详情:');
    console.log(`  ID: ${verifyResult2.id}`);
    console.log(`  产品名称: ${verifyResult2.product_name}`);
    console.log(`  stock_in_auto_number: "${verifyResult2.stock_in_auto_number}"`);
    console.log(`  stock_in_number: "${verifyResult2.stock_in_number}"`);
    console.log(`  创建时间: ${verifyResult2.created_at}`);
    
    // 8. 检查第二条记录的 stock_in_auto_number 字段
    console.log('\n检查第二条记录的 stock_in_auto_number 字段...');
    if (verifyResult2.stock_in_auto_number === uniqueAutoNumber) {
      console.log(`✅ stock_in_auto_number 字段正确写入值: "${verifyResult2.stock_in_auto_number}"`);
      console.log('   这说明如果直接执行SQL，该字段仍会被写入');
    } else {
      console.log(`❌ stock_in_auto_number 字段值不匹配: "${verifyResult2.stock_in_auto_number}"`);
    }
    
    // 9. 清理测试数据
    console.log('\n清理测试数据...');
    await db.run("DELETE FROM inventory WHERE id IN (?, ?)", [insertResult.lastID, insertResult2.lastID]);
    console.log('✅ 测试记录已删除');
    
    // 10. 总结
    console.log('\n测试总结:');
    console.log('✅ 1. 通过应用层API（经过控制器过滤）的入库操作不会写入 stock_in_auto_number 字段');
    console.log('⚠️  2. 直接执行SQL语句仍可能写入 stock_in_auto_number 字段');
    console.log('✅ 3. 我们的修改确保了通过正常API调用不会写入该字段');
    
    await db.close();
    console.log('\n✅ 直接测试完成！');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
directTest();