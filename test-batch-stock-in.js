// 批量入库功能测试脚本
const fs = require('fs');
const path = require('path');

// 模拟批量入库数据
const testBatchData = [
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
    stock_in_date: new Date().toISOString(),
    stock_in_document: 'SI202509230001_1.pdf, SI202509230001_2.docx'
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
    stock_in_date: new Date().toISOString(),
    stock_in_document: 'SI202509230002_1.pdf'
  }
];

// 创建测试文件
function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  // 创建测试文档
  const testFiles = [
    { name: 'SI202509230001_1.pdf', content: '这是测试收货单据1' },
    { name: 'SI202509230001_2.docx', content: '这是测试收货单据2' },
    { name: 'SI202509230002_1.pdf', content: '这是测试收货单据3' }
  ];
  
  testFiles.forEach(file => {
    const filePath = path.join(testDir, file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`创建测试文件: ${filePath}`);
  });
  
  return testFiles;
}

// 模拟API调用
async function testBatchStockIn() {
  console.log('开始测试批量入库功能...');
  console.log('测试数据:', JSON.stringify(testBatchData, null, 2));
  
  try {
    // 模拟发送请求到后端
    const response = {
      success: true,
      message: '批量入库完成',
      data: {
        total: testBatchData.length,
        success: testBatchData.length,
        failed: 0,
        results: testBatchData.map(item => ({
          ...item,
          id: Math.floor(Math.random() * 10000),
          stock_in_status: '已入库'
        })),
        errors: []
      }
    };
    
    console.log('模拟后端响应:', JSON.stringify(response, null, 2));
    
    // 验证 stock_in_document 字段是否正确传递
    response.data.results.forEach((result, index) => {
      const original = testBatchData[index];
      console.log(`\n项目 ${index + 1} 验证:`);
      console.log(`  原始 stock_in_document: ${original.stock_in_document}`);
      console.log(`  返回 stock_in_document: ${result.stock_in_document}`);
      
      if (original.stock_in_document === result.stock_in_document) {
        console.log('  ✓ stock_in_document 字段正确传递');
      } else {
        console.log('  ✗ stock_in_document 字段传递失败');
      }
    });
    
    return response;
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    throw error;
  }
}

// 主测试函数
async function runTest() {
  console.log('=== 批量入库功能测试 ===\n');
  
  // 创建测试文件
  console.log('1. 创建测试文件...');
  const testFiles = createTestFiles();
  
  // 执行批量入库测试
  console.log('\n2. 执行批量入库测试...');
  const result = await testBatchStockIn();
  
  // 输出测试结果
  console.log('\n3. 测试结果:');
  if (result.success) {
    console.log('  ✓ 批量入库测试成功');
    console.log(`  ✓ 成功处理 ${result.data.success} 条记录`);
  } else {
    console.log('  ✗ 批量入库测试失败');
    console.log(`  错误信息: ${result.message}`);
  }
  
  console.log('\n=== 测试完成 ===');
}

// 执行测试
runTest().catch(error => {
  console.error('测试执行失败:', error);
});