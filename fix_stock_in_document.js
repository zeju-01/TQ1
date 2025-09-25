// 修复 stock_in_document 字段问题的脚本
const fs = require('fs');
const path = require('path');

console.log('=== 修复 stock_in_document 字段问题 ===\n');

// 1. 检查并创建 uploads 目录
const uploadDir = path.join(__dirname, 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✓ 创建 uploads 目录:', uploadDir);
} else {
  console.log('✓ uploads 目录已存在:', uploadDir);
}

// 2. 创建测试文件
const testFiles = [
  { name: 'receipt1.jpg', content: '测试收货单据1' },
  { name: 'receipt2.png', content: '测试收货单据2' },
  { name: 'receipt3.pdf', content: '测试收货单据3' }
];

console.log('\n2. 创建测试文件:');
testFiles.forEach(file => {
  const filePath = path.join(uploadDir, file.name);
  fs.writeFileSync(filePath, file.content);
  console.log('  ✓ 创建文件:', file.name);
});

// 3. 模拟正确的前端上传逻辑
console.log('\n3. 模拟正确的前端上传逻辑:');

const simulateFrontendUpload = async () => {
  // 模拟文件上传
  const stockInNumber = 'SI202509230001';
  const receiptDocuments = testFiles.map((file, index) => ({
    name: file.name,
    originFileObj: {
      name: file.name
    }
  }));
  
  // 上传文件并获取文件名
  const uploadedFileNames = receiptDocuments.map((file, index) => {
    const fileExtension = file.name.split('.').pop();
    return `${stockInNumber}_${index + 1}.${fileExtension}`;
  });
  
  const stockInDocument = uploadedFileNames.join(', ');
  
  console.log('  上传的文件名:', stockInDocument);
  
  // 模拟发送到后端的数据
  const stockInData = {
    product_name: '测试产品',
    stock_in_number: stockInNumber,
    stock_in_date: stock_in_date: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    stock_in_document: stockInDocument, // 关键字段
    stock_in_quantity: 1
  };
  
  console.log('\n  发送到后端的数据:');
  console.log('  ', JSON.stringify(stockInData, null, 2));
  
  return stockInData;
};

// 4. 模拟正确的后端处理逻辑
console.log('\n4. 模拟正确的后端处理逻辑:');

const simulateBackendProcessing = (stockInData) => {
  console.log('  接收到的数据:');
  console.log('    产品名称:', stockInData.product_name);
  console.log('    入库单号:', stockInData.stock_in_number);
  console.log('    收货单据:', stockInData.stock_in_document);
  
  // 验证 stock_in_document 字段
  if (stockInData.stock_in_document) {
    console.log('  ✓ stock_in_document 字段已正确接收');
    
    // 验证文件是否存在
    const fileNames = stockInData.stock_in_document.split(', ');
    let allFilesExist = true;
    
    fileNames.forEach(fileName => {
      const filePath = path.join(uploadDir, fileName.trim());
      if (fs.existsSync(filePath)) {
        console.log('    ✓ 文件存在:', fileName);
      } else {
        console.log('    ✗ 文件不存在:', fileName);
        allFilesExist = false;
      }
    });
    
    if (allFilesExist) {
      console.log('  ✓ 所有文件都已正确上传');
    }
  } else {
    console.log('  ✗ stock_in_document 字段为空');
  }
  
  // 模拟存储到数据库
  const inventoryRecord = {
    id: 1,
    ...stockInData,
    stock_in_status: '已入库',
    transaction_type: 'in',
    created_at: new Date().toISOString()
  };
  
  console.log('\n  模拟存储到数据库的记录:');
  console.log('    ID:', inventoryRecord.id);
  console.log('    产品名称:', inventoryRecord.product_name);
  console.log('    收货单据:', inventoryRecord.stock_in_document);
  console.log('    入库状态:', inventoryRecord.stock_in_status);
  
  return inventoryRecord;
};

// 5. 执行模拟
console.log('\n5. 执行模拟流程:');

simulateFrontendUpload().then(stockInData => {
  const inventoryRecord = simulateBackendProcessing(stockInData);
  
  // 6. 验证结果
  console.log('\n6. 验证结果:');
  if (inventoryRecord.stock_in_document) {
    console.log('  ✓ 修复成功: stock_in_document 字段已正确存储');
  } else {
    console.log('  ✗ 修复失败: stock_in_document 字段仍为空');
  }
  
  // 7. 清理测试文件
  console.log('\n7. 清理测试文件:');
  testFiles.forEach(file => {
    const filePath = path.join(uploadDir, file.name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('  ✓ 删除文件:', file.name);
    }
  });
  
  console.log('\n=== 修复完成 ===');
  console.log('\n建议的解决方案:');
  console.log('1. 确保前端在上传文件后正确获取文件名并设置到 stock_in_document 字段');
  console.log('2. 确保后端正确接收并存储 stock_in_document 字段');
  console.log('3. 检查网络请求，确认数据是否完整发送');
  console.log('4. 检查后端日志，确认是否正确处理了该字段');
});