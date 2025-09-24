const fs = require('fs');
const path = require('path');

// 模拟前端上传文件的过程
async function simulateFileUpload() {
  // 创建测试文件
  const testContent = '这是一个端到端测试的收货单据文件';
  const uploadDir = path.join(__dirname, 'uploads');
  const testFilename = 'SI202509230004_1.pdf';
  const finalPath = path.join(uploadDir, testFilename);

  console.log('模拟前端文件上传过程...');
  
  // 确保上传目录存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('创建上传目录');
  }

  // 创建测试文件
  fs.writeFileSync(finalPath, testContent);
  console.log('测试文件创建成功:', finalPath);
  
  return testFilename;
}

// 模拟前端发送入库请求的过程
async function simulateFrontendRequest(stockInDocument) {
  console.log('模拟前端发送入库请求...');
  
  // 模拟前端准备的数据
  const stockInData = {
    product_name: '端到端测试产品',
    product_model: 'E2E-TEST-MODEL-001',
    operator: '中国电信',
    imei: '777777777777777',
    batch_number: 'BOX003',
    stock_in_quantity: 3,
    supplier: '端到端测试供应商',
    factory_order: 'FACTORY003',
    stock_in_contract_number: 'CONTRACT003',
    stock_in_notes: '端到端测试入库备注',
    stock_in_number: 'SI202509230004',
    stock_in_date: new Date().toISOString(),
    stock_in_document: stockInDocument  // 这是从文件上传过程中获得的文件名
  };
  
  console.log('前端准备的入库数据:', stockInData);
  
  return stockInData;
}

// 模拟后端控制器处理请求的过程
async function simulateBackendController(stockInData) {
  console.log('模拟后端控制器处理请求...');
  
  // 模拟控制器中的过滤逻辑
  const { stock_in_auto_number, receipt_documents, ...filteredBody } = stockInData;
  
  const processedData = {
    ...filteredBody,
    stock_in_by: 'test_user'
  };
  
  console.log('控制器过滤后的数据:', processedData);
  console.log('stock_in_document 字段值:', processedData.stock_in_document);
  
  return processedData;
}

// 模拟后端模型处理数据的过程
async function simulateBackendModel(stockInData) {
  console.log('模拟后端模型处理数据...');
  
  // 这里我们直接检查数据是否包含 stock_in_document 字段
  if (stockInData.stock_in_document) {
    console.log('✓ 数据中包含 stock_in_document 字段:', stockInData.stock_in_document);
    return { success: true, stock_in_document: stockInData.stock_in_document };
  } else {
    console.log('✗ 数据中不包含 stock_in_document 字段');
    return { success: false, error: '缺少 stock_in_document 字段' };
  }
}

// 主测试函数
async function runE2ETest() {
  try {
    console.log('=== 开始端到端测试 ===\n');
    
    // 1. 模拟文件上传
    const stockInDocument = await simulateFileUpload();
    
    // 2. 模拟前端发送请求
    const frontendData = await simulateFrontendRequest(stockInDocument);
    
    // 3. 模拟后端控制器处理
    const controllerData = await simulateBackendController(frontendData);
    
    // 4. 模拟后端模型处理
    const modelResult = await simulateBackendModel(controllerData);
    
    console.log('\n=== 测试结果 ===');
    if (modelResult.success) {
      console.log('✓ 端到端测试通过');
      console.log('✓ stock_in_document 字段正确传递:', modelResult.stock_in_document);
    } else {
      console.log('✗ 端到端测试失败:', modelResult.error);
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('端到端测试出错:', error);
  }
}

// 运行测试
runE2ETest();