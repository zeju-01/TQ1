// 调试当前问题
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function debugCurrentIssue() {
  try {
    console.log('调试当前问题...\n');
    
    // 连接数据库
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 1. 检查表结构
    console.log('1. 检查 stock_in_auto_number 字段约束...');
    const tableInfo = await db.all("PRAGMA table_info(inventory)");
    const autoNumberField = tableInfo.find(field => field.name === 'stock_in_auto_number');
    console.log(`   stock_in_auto_number 约束: ${autoNumberField.notnull ? 'NOT NULL' : 'NULL'}`);
    
    // 2. 直接插入一条测试记录
    console.log('\n2. 直接插入测试记录...');
    const testQuery = `
      INSERT INTO inventory (
        product_name, product_model, operator, imei, batch_number,
        stock_in_quantity, supplier, factory_order, stock_in_date,
        stock_in_contract_number, stock_in_document, stock_in_notes,
        stock_in_number, stock_in_auto_number, stock_in_time, created_at,
        stock_in_status, return_status, after_sales_status, other_status,
        quantity, transaction_type, stock_in_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // 使用当前时间
    const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    
    const testParams = [
      '调试测试产品', 'DEBUG-MODEL', '中国移动', '666666666666666', 'DEBUG-BATCH',
      1, '调试供应商', 'DEBUG-WO-001', '2025-09-22',
      'DEBUG-CT-001', '调试单据.pdf', '调试入库',
      'SI202509222222', null, currentTime, currentTime,
      '已入库', '正常', '正常', '正常',
      1, 'in', 'debug_user'
    ];
    
    console.log(`   插入的 stock_in_auto_number 值: ${testParams[13]}`);
    console.log(`   插入的 stock_in_time 值: ${testParams[14]}`);
    
    const insertResult = await db.run(testQuery, testParams);
    console.log(`   ✅ 插入成功，ID: ${insertResult.lastID}`);
    
    // 3. 验证插入的记录
    console.log('\n3. 验证插入的记录...');
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
    
    // 4. 检查问题
    console.log('\n4. 问题检查...');
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
    
    // 5. 清理测试数据
    console.log('\n5. 清理测试数据...');
    await db.run("DELETE FROM inventory WHERE id = ?", [insertResult.lastID]);
    console.log('   ✅ 测试记录已删除');
    
    await db.close();
    console.log('\n✅ 调试完成！');
    
  } catch (error) {
    console.error('调试过程中出错:', error);
  }
}

// 运行调试
debugCurrentIssue();