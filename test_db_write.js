const { executeQuery } = require('./backend/config/database');

async function testDBWrite() {
  try {
    console.log('开始测试数据库写入功能...');
    
    // 插入测试数据
    const query = `
      INSERT INTO inventory (
        product_name, product_model, operator, imei, batch_number, 
        stock_in_quantity, stock_in_status, return_status, after_sales_status, 
        other_status, supplier, factory_name, factory_order, stock_in_date, 
        stock_in_contract_number, stock_in_document, stock_in_by, stock_in_notes, 
        quantity, transaction_type, stock_in_number, stock_in_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      '测试产品',           // product_name
      '测试型号',           // product_model
      '中国移动',           // operator
      '123456789012345',    // imei
      'TEST001',           // batch_number
      1,                   // stock_in_quantity
      '已入库',             // stock_in_status
      '正常',               // return_status
      '正常',               // after_sales_status
      '正常',               // other_status
      '测试供应商',         // supplier
      '测试工厂',           // factory_name
      'FACTORY001',        // factory_order
      '2025-09-25',        // stock_in_date
      'CONTRACT001',       // stock_in_contract_number
      '测试收货单据.pdf',   // stock_in_document
      'test_user',         // stock_in_by
      '测试备注',           // stock_in_notes
      1,                   // quantity
      'in',                // transaction_type
      'SI202509250001',    // stock_in_number
      '2025-09-25 16:30:00', // stock_in_time
      '2025-09-25 16:30:00'  // created_at
    ];
    
    console.log('执行SQL语句:', query);
    console.log('参数:', params);
    
    const result = await executeQuery(query, params);
    console.log('插入结果:', result);
    
    if (result.success) {
      console.log('数据插入成功，记录ID:', result.data.lastID || result.data.insertId);
      
      // 查询刚插入的数据
      const selectQuery = 'SELECT * FROM inventory WHERE id = ?';
      const selectResult = await executeQuery(selectQuery, [result.data.lastID || result.data.insertId]);
      console.log('查询结果:', selectResult.data[0]);
    } else {
      console.error('数据插入失败:', result.error);
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

testDBWrite();