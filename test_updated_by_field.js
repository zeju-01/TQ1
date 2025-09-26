// 测试 updated_by 字段功能
const { executeQuery } = require('./backend/config/database');

async function testUpdatedByField() {
  try {
    console.log('开始测试 updated_by 字段功能...');
    
    // 1. 首先检查 inventory 表结构，确认 updated_by 字段已添加
    console.log('1. 检查 inventory 表结构...');
    const tableInfo = await executeQuery('PRAGMA table_info(inventory)');
    console.log('表字段信息:', tableInfo);
    
    // 处理 SQLite 返回的数据格式
    let columns = [];
    if (Array.isArray(tableInfo.data)) {
      columns = tableInfo.data;
    } else if (tableInfo.data && typeof tableInfo.data === 'object') {
      // 可能是单个对象或其他格式
      columns = [tableInfo.data];
    }
    
    console.log('处理后的列信息:', columns);
    
    // 查找 updated_by 字段
    const updatedByColumn = columns.find(column => 
      column.name === 'updated_by' || 
      column.COLUMN_NAME === 'updated_by' || 
      column.Name === 'updated_by'
    );
    
    if (updatedByColumn) {
      console.log('✓ updated_by 字段存在:', updatedByColumn);
    } else {
      console.log('✗ updated_by 字段不存在');
      console.log('所有字段名:', columns.map(col => col.name || col.COLUMN_NAME || col.Name));
      // 继续执行测试，即使字段检查失败
    }
    
    // 2. 插入一条测试数据
    console.log('\n2. 插入测试数据...');
    const insertQuery = `
      INSERT INTO inventory (
        product_name, product_model, operator, imei, batch_number,
        stock_in_quantity, stock_in_status, return_status, after_sales_status,
        other_status, supplier, factory_name, factory_order, stock_in_date,
        stock_in_contract_number, stock_in_document, stock_in_by, stock_in_notes,
        quantity, transaction_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      '测试产品', '测试型号', '测试运营商', '123456789012345', '测试箱号',
      1, '已入库', '正常', '正常', '正常', '测试供应商', '测试工厂', '测试工单',
      '2025-01-01', '测试合同号', '测试单据', '测试用户', '测试备注',
      1, 'in', '2025-01-01 10:00:00'
    ];
    
    const insertResult = await executeQuery(insertQuery, insertParams);
    const testId = insertResult.data.lastID;
    console.log('插入测试数据成功，ID:', testId);
    
    // 3. 更新数据并检查 updated_by 字段
    console.log('\n3. 更新数据并检查 updated_by 字段...');
    const updateQuery = `
      UPDATE inventory 
      SET supplier = ?, updated_by = ?
      WHERE id = ?
    `;
    
    const updateParams = ['更新后的供应商', '更新用户test', testId];
    await executeQuery(updateQuery, updateParams);
    console.log('更新数据成功');
    
    // 4. 查询更新后的数据
    console.log('\n4. 查询更新后的数据...');
    const selectQuery = 'SELECT * FROM inventory WHERE id = ?';
    const selectResult = await executeQuery(selectQuery, [testId]);
    const updatedRecord = selectResult.data[0];
    
    console.log('更新后的记录:');
    console.log('- 供应商:', updatedRecord.supplier);
    console.log('- updated_by:', updatedRecord.updated_by);
    console.log('- updated_at:', updatedRecord.updated_at);
    
    if (updatedRecord.updated_by === '更新用户test') {
      console.log('✓ updated_by 字段更新成功');
    } else {
      console.log('✗ updated_by 字段更新失败');
    }
    
    // 5. 清理测试数据
    console.log('\n5. 清理测试数据...');
    const deleteQuery = 'DELETE FROM inventory WHERE id = ?';
    await executeQuery(deleteQuery, [testId]);
    console.log('测试数据清理完成');
    
    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
if (require.main === module) {
  testUpdatedByField().then(() => {
    console.log('测试脚本执行完成');
    process.exit(0);
  }).catch((error) => {
    console.error('测试脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { testUpdatedByField };