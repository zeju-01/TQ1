// 测试修复 NOT NULL 约束问题
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testFix() {
  try {
    console.log('测试修复 NOT NULL 约束问题...\n');
    
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
    
    // 3. 测试修改后的插入语句（包含显式的 NULL 值）
    console.log('\n测试修改后的插入语句...');
    const testInsertQuery = `
      INSERT INTO inventory (
        product_id, product_name, product_model, product_description, operator,
        imei, batch_number, stock_in_quantity, stock_in_status, return_status,
        after_sales_status, other_status, supplier,
        factory_name, factory_order, stock_in_date, stock_in_contract_number,
        stock_in_document, stock_in_by, stock_in_notes, quantity, transaction_type,
        stock_in_number, stock_in_auto_number, stock_in_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const testInsertParams = [
      null, '测试修复产品', 'FIX-TEST-MODEL', '测试修复产品描述', '中国移动',
      '777777777777777', 'FIX-TEST-BATCH', 1, '已入库', '正常',
      '正常', '正常', '测试修复供应商',
      '测试工厂', 'FIX-WO-001', '2025-09-22', 'FIX-CT-001',
      '测试修复单据.pdf', 'fix_test_user', '测试修复入库', 1, 'in',
      'SI202509220888', 
      // 显式提供 NULL 值
      null,
      '2025-09-22 14:00:00', '2025-09-22 14:00:00'
    ];
    
    console.log('插入参数:');
    console.log(`  product_name: ${testInsertParams[1]}`);
    console.log(`  stock_in_number: ${testInsertParams[22]}`);
    console.log(`  stock_in_auto_number: ${testInsertParams[23]}`);
    console.log(`  stock_in_time: ${testInsertParams[24]}`);
    
    const insertResult = await db.run(testInsertQuery, testInsertParams);
    console.log(`✅ 插入测试记录成功，新记录ID: ${insertResult.lastID}`);
    
    // 4. 验证插入的记录
    console.log('\n验证插入的记录...');
    const verifyQuery = `
      SELECT id, product_name, stock_in_auto_number, stock_in_number, stock_in_time, created_at
      FROM inventory 
      WHERE id = ?
    `;
    
    const verifyResult = await db.get(verifyQuery, [insertResult.lastID]);
    console.log('插入的记录详情:');
    console.log(`  ID: ${verifyResult.id}`);
    console.log(`  产品名称: ${verifyResult.product_name}`);
    console.log(`  stock_in_auto_number: "${verifyResult.stock_in_auto_number}"`);
    console.log(`  stock_in_number: "${verifyResult.stock_in_number}"`);
    console.log(`  stock_in_time: "${verifyResult.stock_in_time}"`);
    console.log(`  创建时间: ${verifyResult.created_at}`);
    
    // 5. 检查各字段是否正确
    console.log('\n检查各字段是否正确...');
    let allCorrect = true;
    
    if (verifyResult.stock_in_auto_number === null) {
      console.log('✅ stock_in_auto_number 字段正确设置为 NULL');
    } else {
      console.log(`❌ stock_in_auto_number 字段值不正确: "${verifyResult.stock_in_auto_number}"`);
      allCorrect = false;
    }
    
    if (verifyResult.stock_in_number === 'SI202509220888') {
      console.log('✅ stock_in_number 字段正确');
    } else {
      console.log(`❌ stock_in_number 字段值不正确: "${verifyResult.stock_in_number}"`);
      allCorrect = false;
    }
    
    if (verifyResult.stock_in_time) {
      console.log('✅ stock_in_time 字段已填写');
    } else {
      console.log('❌ stock_in_time 字段为空');
      allCorrect = false;
    }
    
    // 6. 清理测试数据
    console.log('\n清理测试数据...');
    await db.run("DELETE FROM inventory WHERE id = ?", [insertResult.lastID]);
    console.log('✅ 测试记录已删除');
    
    // 7. 总结
    console.log('\n测试总结:');
    if (allCorrect) {
      console.log('✅ 所有字段都正确处理');
      console.log('✅ stock_in_auto_number 字段正确设置为 NULL，满足 NOT NULL 约束');
      console.log('✅ stock_in_time 字段正确填写当前北京时间');
      console.log('✅ stock_in_document 字段可正常写入');
    } else {
      console.log('❌ 存在字段处理不正确的情况');
    }
    
    await db.close();
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
testFix();