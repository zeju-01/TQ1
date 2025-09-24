const fs = require('fs');
const path = require('path');
const InventoryModel = require('./models/Inventory');

// 创建测试文件
const testContent = '这是一个测试收货单据文件内容';
const uploadDir = path.join(__dirname, 'uploads');

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('创建上传目录');
}

// 创建测试文件
const testFiles = [
  { name: 'SI202509230004_1.pdf', content: '批量测试收货单据1' },
  { name: 'SI202509230004_2.docx', content: '批量测试收货单据2' },
  { name: 'SI202509230005_1.pdf', content: '批量测试收货单据3' }
];

testFiles.forEach(file => {
  const filePath = path.join(uploadDir, file.name);
  fs.writeFileSync(filePath, file.content);
  console.log('创建测试文件:', filePath);
});

console.log('测试文件创建成功');

// 模拟批量入库数据，包含收货单据信息
const batchStockInList = [
  {
    product_name: '批量测试产品A',
    product_model: 'BATCH-TEST-MODEL-A',
    operator: '中国移动',
    imei: '666666666666661',
    batch_number: 'BATCH-BOX001',
    stock_in_quantity: 1,
    supplier: '批量测试供应商',
    factory_order: 'BATCH-FACTORY001',
    stock_in_contract_number: 'BATCH-CONTRACT001',
    stock_in_notes: '批量测试入库备注A',
    stock_in_number: 'SI202509230004',
    stock_in_date: new Date().toISOString(),
    stock_in_by: 'batch_test_user',
    stock_in_document: 'SI202509230004_1.pdf, SI202509230004_2.docx'  // 收货单据文件名
  },
  {
    product_name: '批量测试产品B',
    product_model: 'BATCH-TEST-MODEL-B',
    operator: '中国联通',
    imei: '666666666666662',
    batch_number: 'BATCH-BOX002',
    stock_in_quantity: 2,
    supplier: '批量测试供应商',
    factory_order: 'BATCH-FACTORY002',
    stock_in_contract_number: 'BATCH-CONTRACT002',
    stock_in_notes: '批量测试入库备注B',
    stock_in_number: 'SI202509230005',
    stock_in_date: new Date().toISOString(),
    stock_in_by: 'batch_test_user',
    stock_in_document: 'SI202509230005_1.pdf'  // 收货单据文件名
  }
];

console.log('准备批量入库数据:', JSON.stringify(batchStockInList, null, 2));

// 测试批量入库操作
async function testBatchStockIn() {
  try {
    console.log('开始测试批量入库操作...');
    const result = await InventoryModel.batchStockIn(batchStockInList);
    console.log('批量入库结果:', result);
    
    // 验证数据库中是否正确保存了stock_in_document字段
    console.log('\n验证 stock_in_document 字段:');
    if (result.success > 0) {
      result.results.forEach((item, index) => {
        const original = batchStockInList[index];
        console.log(`\n项目 ${index + 1}:`);
        console.log(`  产品名称: ${item.product_name}`);
        console.log(`  入库单据: ${item.stock_in_document}`);
        console.log(`  期望值: ${original.stock_in_document}`);
        
        if (item.stock_in_document === original.stock_in_document) {
          console.log('  ✓ stock_in_document字段正确保存到数据库');
        } else {
          console.log('  ✗ stock_in_document字段未正确保存到数据库');
        }
      });
    } else {
      console.log('✗ 批量入库失败');
    }
    
    console.log('\n测试完成');
    return result;
  } catch (error) {
    console.error('批量入库测试失败:', error);
    throw error;
  }
}

testBatchStockIn();