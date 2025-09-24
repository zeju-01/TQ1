// 检查约束详情
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkConstraintDetails() {
  try {
    console.log('检查约束详情...\n');
    
    // 连接数据库
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 检查是否有任何约束相关的触发器或检查约束
    console.log('1. 检查表的约束信息...');
    
    // 尝试插入一条所有字段都为 NULL 的记录来测试
    console.log('\n2. 测试插入空记录...');
    try {
      const testQuery = `
        INSERT INTO inventory (
          product_id, product_name, product_model, product_description, operator,
          imei, batch_number, stock_in_quantity, stock_in_status, return_status,
          after_sales_status, other_status, supplier,
          factory_name, factory_order, stock_in_date, stock_in_contract_number,
          stock_in_document, stock_in_by, stock_in_notes, quantity, transaction_type,
          stock_in_number, stock_in_auto_number, stock_in_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const testParams = [
        null, null, null, null, null,
        null, null, null, null, null,
        null, null, null,
        null, null, null, null,
        null, null, null, null, null,
        null, '', null, null  // stock_in_auto_number 设置为空字符串
      ];
      
      const result = await db.run(testQuery, testParams);
      console.log(`✅ 插入空字符串成功，ID: ${result.lastID}`);
      
      // 删除测试记录
      await db.run("DELETE FROM inventory WHERE id = ?", [result.lastID]);
      console.log('✅ 测试记录已删除');
      
    } catch (error) {
      console.log('❌ 插入空字符串失败:', error.message);
    }
    
    // 再次尝试使用 NULL
    console.log('\n3. 测试插入 NULL 值...');
    try {
      const testQuery2 = `
        INSERT INTO inventory (
          product_id, product_name, product_model, product_description, operator,
          imei, batch_number, stock_in_quantity, stock_in_status, return_status,
          after_sales_status, other_status, supplier,
          factory_name, factory_order, stock_in_date, stock_in_contract_number,
          stock_in_document, stock_in_by, stock_in_notes, quantity, transaction_type,
          stock_in_number, stock_in_auto_number, stock_in_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const testParams2 = [
        null, null, null, null, null,
        null, null, null, null, null,
        null, null, null,
        null, null, null, null,
        null, null, null, null, null,
        null, null, null, null  // stock_in_auto_number 设置为 NULL
      ];
      
      const result2 = await db.run(testQuery2, testParams2);
      console.log(`✅ 插入 NULL 值成功，ID: ${result2.lastID}`);
      
      // 删除测试记录
      await db.run("DELETE FROM inventory WHERE id = ?", [result2.lastID]);
      console.log('✅ 测试记录已删除');
      
    } catch (error) {
      console.log('❌ 插入 NULL 值失败:', error.message);
    }
    
    await db.close();
    console.log('\n✅ 约束详情检查完成！');
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  }
}

// 运行检查
checkConstraintDetails();