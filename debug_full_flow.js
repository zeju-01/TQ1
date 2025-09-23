// 完整流程调试脚本
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 模拟请求数据
const mockRequestData = {
  product_id: 1,
  product_name: "测试产品",
  product_model: "测试型号",
  product_description: "测试产品描述",
  operator: "测试运营商",
  imei: "123456789012345",
  batch_number: "BATCH001",
  stock_in_quantity: 1,
  supplier: "测试供应商",
  factory_name: "测试工厂",
  factory_order: "ORDER001",
  stock_in_date: "2025-09-22",
  stock_in_contract_number: "CONTRACT001",
  stock_in_document: "测试单据.pdf",
  stock_in_by: "test_user",
  stock_in_notes: "测试备注",
  stock_in_number: "SI202509220001"
};

async function debugFullFlow() {
  try {
    console.log('=== 完整流程调试 ===\n');
    
    // 1. 显示原始请求数据
    console.log('1. 原始请求数据:');
    console.log(JSON.stringify(mockRequestData, null, 2));
    
    // 2. 模拟控制器中的过滤逻辑
    console.log('\n2. 控制器过滤逻辑:');
    const { stock_in_auto_number, ...filteredBody } = mockRequestData;
    console.log('过滤后的数据:');
    console.log(JSON.stringify(filteredBody, null, 2));
    
    // 3. 模拟模型中的处理逻辑
    console.log('\n3. 模型处理逻辑:');
    
    // 获取当前北京时间
    const beijingTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    console.log('当前北京时间:', beijingTime);
    
    // 构建插入参数
    const params = [
      filteredBody.product_id,
      filteredBody.product_name,
      filteredBody.product_model,
      filteredBody.product_description,
      filteredBody.operator,
      filteredBody.imei,
      filteredBody.batch_number,
      filteredBody.stock_in_quantity,
      '已入库', // stock_in_status
      '正常',   // return_status
      '正常',   // after_sales_status
      '正常',   // other_status
      filteredBody.supplier,
      filteredBody.factory_name,
      filteredBody.factory_order,
      filteredBody.stock_in_date,
      filteredBody.stock_in_contract_number,
      filteredBody.stock_in_document,
      filteredBody.stock_in_by,
      filteredBody.stock_in_notes,
      filteredBody.stock_in_quantity,
      'in',     // transaction_type
      filteredBody.stock_in_number || null,
      // 显式设置 stock_in_auto_number 为 NULL
      null,
      // 设置 stock_in_time 为当前北京时间
      beijingTime,
      // 设置 created_at 为当前时间
      beijingTime
    ];
    
    console.log('构建的SQL参数:');
    console.log('stock_in_auto_number 参数值:', params[23]); // 索引23是stock_in_auto_number
    console.log('stock_in_time 参数值:', params[24]);       // 索引24是stock_in_time
    
    // 4. 执行数据库插入
    console.log('\n4. 执行数据库插入:');
    const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    const query = `
      INSERT INTO inventory (
        product_id, product_name, product_model, product_description, operator,
        imei, batch_number, stock_in_quantity, stock_in_status, return_status,
        after_sales_status, other_status, supplier,
        factory_name, factory_order, stock_in_date, stock_in_contract_number,
        stock_in_document, stock_in_by, stock_in_notes, quantity, transaction_type,
        stock_in_number, stock_in_auto_number, stock_in_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    console.log('执行SQL:', query);
    const result = await db.run(query, params);
    console.log('插入结果:', result);
    
    // 5. 验证插入的数据
    console.log('\n5. 验证插入的数据:');
    const insertedRecord = await db.get('SELECT * FROM inventory WHERE imei = ?', [mockRequestData.imei]);
    console.log('插入的记录:');
    console.log(`  ID: ${insertedRecord.id}`);
    console.log(`  IMEI: ${insertedRecord.imei}`);
    console.log(`  stock_in_time: ${insertedRecord.stock_in_time}`);
    console.log(`  stock_in_auto_number: ${insertedRecord.stock_in_auto_number}`);
    console.log(`  created_at: ${insertedRecord.created_at}`);
    
    await db.close();
    
    console.log('\n✅ 调试完成！');
    
  } catch (error) {
    console.error('调试过程中出错:', error);
  }
}

// 运行调试
debugFullFlow();