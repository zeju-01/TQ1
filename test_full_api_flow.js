// 测试完整的 API 流程
const fs = require('fs');
const path = require('path');

// 模拟后端处理流程
function simulateFullAPIFlow() {
  console.log('模拟完整的 API 流程...\n');
  
  // 1. 模拟接收到的前端请求
  console.log('1. 模拟接收到的前端请求...');
  const reqBody = {
    product_name: 'API测试产品',
    product_model: 'API-MODEL',
    operator: '中国电信',
    imei: '888888888888888',
    batch_number: 'API-BATCH',
    stock_in_quantity: 3,
    supplier: 'API供应商',
    factory_order: 'API-WO-001',
    stock_in_date: '2025-09-22',
    stock_in_contract_number: 'API-CT-001',
    stock_in_document: 'API单据.pdf',
    stock_in_notes: 'API入库',
    stock_in_number: 'SI202509224444',
    // 前端可能传递的已废弃字段
    stock_in_auto_number: 'IN20250922002222'
  };
  
  console.log(`   请求中的 stock_in_auto_number: "${reqBody.stock_in_auto_number}"`);
  
  // 2. 模拟控制器处理
  console.log('\n2. 模拟控制器处理...');
  // 过滤掉已废弃的字段
  const { stock_in_auto_number, ...filteredBody } = reqBody;
  
  const stockInData = {
    ...filteredBody,
    stock_in_by: 'api_test_user'
  };
  
  console.log(`   控制器过滤后是否还有 stock_in_auto_number: ${'stock_in_auto_number' in stockInData}`);
  console.log('   控制器处理后的数据:', stockInData);
  
  // 3. 模拟模型处理
  console.log('\n3. 模拟模型处理...');
  // 获取当前北京时间
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
    stockInData.product_name, stockInData.product_model, stockInData.operator, stockInData.imei, stockInData.batch_number,
    stockInData.stock_in_quantity, stockInData.supplier, stockInData.factory_order, stockInData.stock_in_date,
    stockInData.stock_in_contract_number, stockInData.stock_in_document, stockInData.stock_in_notes,
    stockInData.stock_in_number, 
    // 关键：显式设置为 NULL
    null,
    beijingTime, beijingTime,
    '已入库', '正常', '正常', '正常',
    stockInData.stock_in_quantity, 'in', stockInData.stock_in_by
  ];
  
  console.log(`   SQL 查询: ${query}`);
  console.log(`   SQL 参数: [${params.map((p, i) => `\n     ${i}: ${p === null ? 'NULL' : `"${p}"`}`)}]`);
  
  // 4. 检查参数中的关键字段
  console.log('\n4. 检查关键字段...');
  const autoNumberIndex = 13; // stock_in_auto_number 的索引
  const timeIndex = 14; // stock_in_time 的索引
  
  console.log(`   stock_in_auto_number 参数值: ${params[autoNumberIndex] === null ? 'NULL' : `"${params[autoNumberIndex]}"`}`);
  console.log(`   stock_in_time 参数值: ${params[timeIndex] === null ? 'NULL' : `"${params[timeIndex]}"`}`);
  
  // 5. 验证逻辑
  console.log('\n5. 验证逻辑...');
  if (params[autoNumberIndex] === null) {
    console.log('   ✅ stock_in_auto_number 正确设置为 NULL');
  } else {
    console.log(`   ❌ stock_in_auto_number 错误值: "${params[autoNumberIndex]}"`);
  }
  
  if (params[timeIndex]) {
    console.log(`   ✅ stock_in_time 正确填写: "${params[timeIndex]}"`);
  } else {
    console.log('   ❌ stock_in_time 未填写');
  }
  
  console.log('\n✅ 完整 API 流程模拟完成！');
}

// 运行模拟
simulateFullAPIFlow();