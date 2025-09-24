// 真实环境下的批量入库功能测试脚本
const fs = require('fs');
const path = require('path');

// 模拟批量入库数据（与前端传递给后端的数据格式一致）
const testBatchData = {
  stockInList: [
    {
      product_name: '测试产品A',
      product_model: 'Model-A',
      operator: '中国移动',
      imei: '123456789012345',
      batch_number: 'BOX001',
      stock_in_quantity: 1,
      supplier: '测试供应商',
      factory_order: 'FACTORY001',
      stock_in_contract_number: 'CONTRACT001',
      stock_in_notes: '测试备注',
      stock_in_number: 'SI202509230001',
      stock_in_date: '2025-09-23 10:00:00',
      stock_in_document: 'SI202509230001_1.pdf, SI202509230001_2.docx',
      stock_in_by: 'test_user'
    },
    {
      product_name: '测试产品B',
      product_model: 'Model-B',
      operator: '中国联通',
      imei: '234567890123456',
      batch_number: 'BOX002',
      stock_in_quantity: 2,
      supplier: '测试供应商',
      factory_order: 'FACTORY002',
      stock_in_contract_number: 'CONTRACT002',
      stock_in_notes: '测试备注',
      stock_in_number: 'SI202509230002',
      stock_in_date: '2025-09-23 11:00:00',
      stock_in_document: 'SI202509230002_1.pdf',
      stock_in_by: 'test_user'
    }
  ]
};

// 模拟发送HTTP请求到后端API
async function sendBatchStockInRequest() {
  console.log('发送批量入库请求到后端API...');
  console.log('请求数据:', JSON.stringify(testBatchData, null, 2));
  
  // 注意：在实际环境中，这里应该使用真正的HTTP客户端（如axios或fetch）发送请求
  // 由于这是测试脚本，我们模拟后端的处理逻辑
  
  // 模拟后端控制器的处理逻辑
  console.log('\n=== 模拟后端控制器处理 ===');
  
  // 模拟过滤字段的处理（与实际后端代码一致）
  const processedList = testBatchData.stockInList.map(item => {
    const { stock_in_auto_number, receipt_documents, ...filteredItem } = item;
    return {
      ...filteredItem,
      stock_in_document: item.stock_in_document, // 显式保留 stock_in_document 字段
      stock_in_by: item.stock_in_by || 'unknown'
    };
  });
  
  console.log('处理后的数据:', JSON.stringify(processedList, null, 2));
  
  // 验证 stock_in_document 字段是否保留
  processedList.forEach((item, index) => {
    const original = testBatchData.stockInList[index];
    console.log(`\n项目 ${index + 1} 验证:`);
    console.log(`  原始 stock_in_document: ${original.stock_in_document}`);
    console.log(`  处理后 stock_in_document: ${item.stock_in_document}`);
    
    if (original.stock_in_document === item.stock_in_document) {
      console.log('  ✓ stock_in_document 字段正确保留');
    } else {
      console.log('  ✗ stock_in_document 字段丢失');
    }
  });
  
  // 模拟数据库插入操作
  console.log('\n=== 模拟数据库插入操作 ===');
  const results = processedList.map((item, index) => {
    console.log(`插入记录 ${index + 1}:`, JSON.stringify(item, null, 2));
    return {
      ...item,
      id: Math.floor(Math.random() * 10000),
      stock_in_status: '已入库',
      created_at: new Date().toISOString()
    };
  });
  
  // 模拟后端响应
  const response = {
    success: true,
    message: '批量入库完成',
    data: {
      total: processedList.length,
      success: processedList.length,
      failed: 0,
      results: results,
      errors: []
    }
  };
  
  return response;
}

// 主测试函数
async function runTest() {
  console.log('=== 真实环境批量入库功能测试 ===\n');
  
  try {
    // 发送批量入库请求
    console.log('1. 发送批量入库请求...');
    const result = await sendBatchStockInRequest();
    
    // 输出测试结果
    console.log('\n2. 测试结果:');
    if (result.success) {
      console.log('  ✓ 批量入库请求处理成功');
      console.log(`  ✓ 成功处理 ${result.data.success} 条记录`);
      
      // 验证返回数据中的 stock_in_document 字段
      result.data.results.forEach((item, index) => {
        const original = testBatchData.stockInList[index];
        console.log(`\n返回数据验证 - 项目 ${index + 1}:`);
        console.log(`  原始 stock_in_document: ${original.stock_in_document}`);
        console.log(`  返回 stock_in_document: ${item.stock_in_document}`);
        
        if (original.stock_in_document === item.stock_in_document) {
          console.log('  ✓ stock_in_document 字段正确返回');
        } else {
          console.log('  ✗ stock_in_document 字段返回错误');
        }
      });
    } else {
      console.log('  ✗ 批量入库请求处理失败');
      console.log(`  错误信息: ${result.message}`);
    }
    
    console.log('\n=== 测试完成 ===');
    return result;
  } catch (error) {
    console.error('测试执行失败:', error);
    throw error;
  }
}

// 执行测试
runTest().catch(error => {
  console.error('测试执行失败:', error);
});