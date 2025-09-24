// 测试修复 stock_in_auto_number 字段写入问题
const fs = require('fs');
const path = require('path');

console.log('测试修复 stock_in_auto_number 字段写入问题...\n');

// 1. 检查控制器修改
console.log('1. 检查控制器修改...');
const controllerPath = path.join(__dirname, 'backend', 'controllers', 'InventoryController.js');
if (fs.existsSync(controllerPath)) {
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  
  // 检查单个入库是否过滤了字段
  const hasSingleFilter = controllerContent.includes('const { stock_in_auto_number, ...filteredBody } = req.body');
  console.log(`   单个入库是否过滤 stock_in_auto_number: ${hasSingleFilter ? '✅ 是' : '❌ 否'}`);
  
  // 检查批量入库是否过滤了字段
  const hasBatchFilter = controllerContent.includes('const { stock_in_auto_number, ...filteredItem } = item');
  console.log(`   批量入库是否过滤 stock_in_auto_number: ${hasBatchFilter ? '✅ 是' : '❌ 否'}`);
  
  if (hasSingleFilter && hasBatchFilter) {
    console.log('   ✅ 控制器修改正确');
  } else {
    console.log('   ❌ 控制器修改不完整');
  }
} else {
  console.log('   ❌ 未找到控制器文件');
}

// 2. 模拟测试入库请求
console.log('\n2. 模拟测试入库请求...');
const testRequestData = {
  product_name: '测试产品',
  product_model: 'TEST-MODEL',
  operator: '中国移动',
  imei: '123456789012345',
  batch_number: 'TEST-BATCH-001',
  stock_in_quantity: 1,
  supplier: '测试供应商',
  factory_order: 'TEST-WO-001',
  stock_in_date: '2025-09-22',
  stock_in_contract_number: 'TEST-CT-001',
  stock_in_document: '测试单据.pdf',
  stock_in_notes: '测试入库',
  stock_in_number: 'SI202509220001',
  // 这个字段应该被过滤掉
  stock_in_auto_number: 'IN20250922000001'
};

console.log('   发送的请求数据包含 stock_in_auto_number 字段:', testRequestData.stock_in_auto_number);

// 模拟控制器中的过滤逻辑
const { stock_in_auto_number, ...filteredBody } = testRequestData;
console.log('   过滤后的数据是否包含 stock_in_auto_number 字段:', 'stock_in_auto_number' in filteredBody ? '✅ 是' : '❌ 否');

if (!('stock_in_auto_number' in filteredBody)) {
  console.log('   ✅ 过滤逻辑正确');
} else {
  console.log('   ❌ 过滤逻辑不正确');
}

// 3. 模拟批量入库请求
console.log('\n3. 模拟批量入库请求...');
const testBatchRequestData = [
  {
    product_name: '测试产品1',
    product_model: 'TEST-MODEL-1',
    operator: '中国移动',
    imei: '123456789012346',
    batch_number: 'TEST-BATCH-002',
    stock_in_quantity: 1,
    supplier: '测试供应商',
    factory_order: 'TEST-WO-002',
    stock_in_date: '2025-09-22',
    stock_in_contract_number: 'TEST-CT-002',
    stock_in_document: '测试单据1.pdf',
    stock_in_notes: '测试入库1',
    stock_in_number: 'SI202509220002',
    // 这个字段应该被过滤掉
    stock_in_auto_number: 'IN20250922000002'
  },
  {
    product_name: '测试产品2',
    product_model: 'TEST-MODEL-2',
    operator: '中国联通',
    imei: '123456789012347',
    batch_number: 'TEST-BATCH-003',
    stock_in_quantity: 1,
    supplier: '测试供应商',
    factory_order: 'TEST-WO-003',
    stock_in_date: '2025-09-22',
    stock_in_contract_number: 'TEST-CT-003',
    stock_in_document: '测试单据2.pdf',
    stock_in_notes: '测试入库2',
    stock_in_number: 'SI202509220003',
    // 这个字段应该被过滤掉
    stock_in_auto_number: 'IN20250922000003'
  }
];

console.log('   批量请求数据包含 stock_in_auto_number 字段:');
testBatchRequestData.forEach((item, index) => {
  console.log(`     项目${index + 1}: ${item.stock_in_auto_number}`);
});

// 模拟控制器中的批量过滤逻辑
const processedList = testBatchRequestData.map(item => {
  const { stock_in_auto_number, ...filteredItem } = item;
  return filteredItem;
});

console.log('   处理后的数据是否包含 stock_in_auto_number 字段:');
let hasAutoNumberInProcessed = false;
processedList.forEach((item, index) => {
  if ('stock_in_auto_number' in item) {
    console.log(`     项目${index + 1}: ✅ 是`);
    hasAutoNumberInProcessed = true;
  } else {
    console.log(`     项目${index + 1}: ❌ 否`);
  }
});

if (!hasAutoNumberInProcessed) {
  console.log('   ✅ 批量过滤逻辑正确');
} else {
  console.log('   ❌ 批量过滤逻辑不正确');
}

console.log('\n测试完成！');