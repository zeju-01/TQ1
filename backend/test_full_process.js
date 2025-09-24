const fs = require('fs');
const path = require('path');

console.log('开始测试完整的文件上传和入库过程...');

// 1. 创建测试文件
const testContent = '这是一个测试收货单据文件内容';
const testFileName = 'test_receipt.png';
const testFilePath = path.join(__dirname, testFileName);

fs.writeFileSync(testFilePath, testContent);
console.log('1. 创建测试文件:', testFileName);

// 2. 模拟前端文件上传过程
async function simulateFileUpload() {
  try {
    // 创建FormData
    const FormData = require('form-data');
    const form = new FormData();
    
    // 添加文件到表单
    form.append('files', fs.createReadStream(testFilePath));
    
    console.log('2. 准备上传文件...');
    
    // 注意：这里我们只是模拟，实际测试需要运行服务器
    console.log('   文件上传需要后端服务运行，这里只模拟前端逻辑');
    
    // 生成文件名
    const stockInNumber = 'SI202509220001';
    const fileExtension = testFileName.split('.').pop();
    const newFileName = `${stockInNumber}_1.${fileExtension}`;
    
    console.log('   生成的文件名:', newFileName);
    
    return newFileName;
  } catch (error) {
    console.error('文件上传模拟出错:', error);
    return null;
  }
}

// 3. 模拟入库数据准备
function simulateStockInData(fileName) {
  const stockInData = {
    product_name: '测试产品',
    product_model: '测试型号',
    operator: '测试运营商',
    imei: '123456789012345',
    batch_number: 'BOX001',
    stock_in_quantity: 1,
    supplier: '测试供应商',
    factory_order: 'FACTORY001',
    stock_in_contract_number: 'CONTRACT001',
    stock_in_notes: '测试备注',
    stock_in_number: 'SI202509220001',
    stock_in_date: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    stock_in_document: fileName || ''  // 这是关键字段
  };
  
  console.log('3. 准备入库数据:');
  console.log(JSON.stringify(stockInData, null, 2));
  
  return stockInData;
}

// 4. 模拟SQL插入
function simulateSQLInsert(stockInData) {
  const sql = `
INSERT INTO inventory (
  product_name, product_model, operator, imei, batch_number,
  stock_in_quantity, supplier, factory_order, stock_in_contract_number,
  stock_in_notes, stock_in_number, stock_in_date, stock_in_document,
  stock_in_status, return_status, after_sales_status, other_status,
  quantity, transaction_type
) VALUES (
  '${stockInData.product_name}', '${stockInData.product_model}', '${stockInData.operator}',
  '${stockInData.imei}', '${stockInData.batch_number}', ${stockInData.stock_in_quantity},
  '${stockInData.supplier}', '${stockInData.factory_order}', '${stockInData.stock_in_contract_number}',
  '${stockInData.stock_in_notes}', '${stockInData.stock_in_number}', '${stockInData.stock_in_date}',
  '${stockInData.stock_in_document}', '已入库', '正常', '正常', '正常',
  ${stockInData.stock_in_quantity}, 'in'
)
`;
  
  console.log('4. 模拟SQL语句:');
  console.log(sql);
  
  return sql;
}

// 5. 执行完整流程
async function runFullProcess() {
  try {
    // 模拟文件上传
    const uploadedFileName = await simulateFileUpload();
    
    // 准备入库数据
    const stockInData = simulateStockInData(uploadedFileName);
    
    // 模拟SQL插入
    const sql = simulateSQLInsert(stockInData);
    
    // 6. 验证文件是否存在
    console.log('5. 验证文件是否存在:');
    const uploadDir = path.join(__dirname, 'uploads');
    console.log('   上传目录:', uploadDir);
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      console.log('   上传目录中的文件:', files);
    } else {
      console.log('   上传目录不存在');
    }
    
    // 7. 清理测试文件
    fs.unlinkSync(testFilePath);
    console.log('6. 清理测试文件');
    
    console.log('完整的文件上传和入库测试完成！');
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

runFullProcess();