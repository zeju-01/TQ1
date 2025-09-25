const fs = require('fs');
const path = require('path');
const InventoryModel = require('./models/Inventory');

// 创建一个测试文件
const testContent = '这是修复后的测试收货单据文件内容';
const uploadDir = path.join(__dirname, 'uploads');
const testFilename = 'SI202509230003_1.pdf';
const finalPath = path.join(uploadDir, testFilename);

console.log('创建测试文件:', finalPath);

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('创建上传目录');
}

// 创建测试文件
fs.writeFileSync(finalPath, testContent);
console.log('测试文件创建成功');

// 模拟入库数据，包含收货单据信息
const stockInData = {
  product_name: '修复测试产品',
  product_model: 'FIX-TEST-MODEL-001',
  operator: '中国联通',
  imei: '888888888888888',
  batch_number: 'BOX002',
  stock_in_quantity: 2,
  supplier: '修复测试供应商',
  factory_order: 'FACTORY002',
  stock_in_contract_number: 'CONTRACT002',
  stock_in_notes: '修复测试入库备注',
  stock_in_number: 'SI202509230003',
  stock_in_date: stock_in_date: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
  stock_in_by: 'test_user',
  stock_in_document: testFilename  // 收货单据文件名
};

console.log('准备入库数据:', stockInData);

// 测试入库操作
async function testStockIn() {
  try {
    console.log('开始测试入库操作...');
    const result = await InventoryModel.createStockIn(stockInData);
    console.log('入库成功:', result);
    
    // 验证数据库中是否正确保存了stock_in_document字段
    if (result && result.stock_in_document === testFilename) {
      console.log('✓ stock_in_document字段正确保存到数据库');
    } else {
      console.log('✗ stock_in_document字段未正确保存到数据库');
      console.log('期望值:', testFilename);
      console.log('实际值:', result ? result.stock_in_document : 'null');
    }
    
    // 清理测试数据
    // 注意：在实际测试中，您可能需要从数据库中删除这条测试记录
    console.log('测试完成');
  } catch (error) {
    console.error('入库测试失败:', error);
  }
}

testStockIn();