const fs = require('fs');
const path = require('path');

console.log('开始完整的文件上传和入库测试...');

// 1. 创建测试文件
const testContent = '这是一个测试收货单据文件';
const testFileName = 'test_receipt.png';
const testFilePath = path.join(__dirname, testFileName);

fs.writeFileSync(testFilePath, testContent);
console.log('1. 创建测试文件:', testFileName);

// 2. 模拟前端上传文件
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const stockInNumber = 'SI202509220001';
const fileExtension = testFileName.split('.').pop();
const newFileName = `${stockInNumber}_1.${fileExtension}`;
const finalPath = path.join(uploadDir, newFileName);

fs.copyFileSync(testFilePath, finalPath);
console.log('2. 文件上传完成，新文件名:', newFileName);

// 3. 模拟前端准备入库数据
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
  stock_in_number: stockInNumber,
  stock_in_date: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
  stock_in_document: newFileName  // 这是关键字段
};

console.log('3. 准备入库数据:');
console.log(JSON.stringify(stockInData, null, 2));

// 4. 模拟后端保存到数据库（这里我们只是打印SQL）
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

// 5. 验证文件是否存在
console.log('5. 验证文件是否存在:');
console.log('文件路径:', finalPath);
console.log('文件是否存在:', fs.existsSync(finalPath));

// 6. 清理测试文件
fs.unlinkSync(testFilePath);
console.log('6. 清理测试文件');

console.log('完整的文件上传和入库测试完成！');