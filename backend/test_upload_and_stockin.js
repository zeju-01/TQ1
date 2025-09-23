const fs = require('fs');
const path = require('path');
const { executeQuery } = require('./config/database');

async function testUploadAndStockIn() {
  try {
    // 初始化数据库
    const dbModule = require('./config/database');
    await dbModule.initDatabase();
    
    console.log('创建测试文件...');
    const testFilePath = path.join(__dirname, 'test_document.txt');
    fs.writeFileSync(testFilePath, '这是一个测试文件内容，用于验证文件上传功能。');
    
    console.log('模拟文件上传...');
    // 模拟上传文件后的文件名
    const stockInNumber = 'SI202509220001';
    const testFileName = `${stockInNumber}_1.txt`;
    const uploadDir = path.join(__dirname, 'uploads');
    const finalFilePath = path.join(uploadDir, testFileName);
    
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // 移动测试文件到上传目录
    fs.copyFileSync(testFilePath, finalFilePath);
    console.log(`文件已上传到: ${finalFilePath}`);
    
    console.log('执行入库操作...');
    // 直接执行SQL插入，绕过模型中的自动生成逻辑
    const query = `
      INSERT INTO inventory (
        product_name, product_model, operator,
        imei, batch_number, stock_in_quantity, stock_in_status, return_status,
        after_sales_status, other_status, supplier,
        factory_order, stock_in_date, stock_in_contract_number,
        stock_in_document, stock_in_by, stock_in_notes, quantity, transaction_type,
        stock_in_number, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      '测试产品', '测试型号', '中国移动',
      '123456789012346', 'TEST001', 1, '已入库', '正常',
      '正常', '正常', '测试供应商',
      'FACTORY001', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }), 'CONTRACT001',
      testFileName, 'test_user', '测试入库备注', 1, 'in',
      stockInNumber,
      new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    ];

    console.log('执行入库SQL:', query);
    console.log('SQL参数:', params);

    const result = await executeQuery(query, params);
    console.log('插入结果:', result);
    
    if (result.success) {
      // 获取插入的记录ID
      const insertId = result.data.lastID || result.data.insertId;
      
      // 查询刚插入的记录
      console.log('查询刚插入的记录...');
      const queryResult = await executeQuery(
        'SELECT id, stock_in_number, stock_in_document, created_at FROM inventory WHERE id = ?', 
        [insertId]
      );
      console.log('查询结果:', queryResult);
    }
    
    // 清理测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    console.log('测试完成');
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

testUploadAndStockIn();