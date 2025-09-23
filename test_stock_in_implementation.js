// 测试入库功能实现
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testStockInImplementation() {
  try {
    console.log('测试入库功能实现...\n');
    
    // 连接数据库
    const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 模拟一次入库操作
    console.log('模拟入库操作...');
    
    // 获取当前北京时间
    const beijingTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    console.log('当前北京时间:', beijingTime);
    
    // 插入测试数据
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
    
    const testIMEI = 'TEST' + Date.now();
    const params = [
      1, '测试产品', '测试型号', '测试描述', '测试操作员',
      testIMEI, 'TEST_BATCH', 1, '已入库', '正常',
      '正常', '正常', '测试供应商',
      '测试工厂', 'TEST_ORDER', beijingTime, 'TEST_CONTRACT',
      '测试收货单据', '测试用户', '测试备注', 1, 'in',
      'SI202509220001',
      // stock_in_auto_number 字段，显式设置为 NULL
      null,
      // stock_in_time 字段，使用当前北京时间
      beijingTime,
      // created_at 字段，使用当前时间
      beijingTime
    ];
    
    console.log('执行插入操作...');
    const result = await db.run(query, params);
    console.log('插入结果:', result);
    
    // 查询刚刚插入的记录
    console.log('\n查询刚刚插入的记录...');
    const record = await db.get('SELECT * FROM inventory WHERE imei = ?', [testIMEI]);
    console.log('插入的记录:');
    console.log('  ID:', record.id);
    console.log('  IMEI:', record.imei);
    console.log('  stock_in_time:', record.stock_in_time === null ? 'NULL' : record.stock_in_time);
    console.log('  stock_in_auto_number:', record.stock_in_auto_number === null ? 'NULL' : record.stock_in_auto_number);
    console.log('  created_at:', record.created_at);
    
    // 删除测试记录
    console.log('\n删除测试记录...');
    await db.run('DELETE FROM inventory WHERE imei = ?', [testIMEI]);
    console.log('测试记录已删除');
    
    await db.close();
    console.log('\n✅ 入库功能测试完成！');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
testStockInImplementation();