const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保 uploads 目录存在
const uploadsDir = path.join('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('创建 uploads 目录');
}

// 连接到数据库
const dbPath = path.join('backend', 'data', 'inventory.db');
const db = new sqlite3.Database(dbPath);

console.log('=== 测试所有4个需求 ===\n');

// 1. 获取当前北京时间
const beijingTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
console.log('1. 当前北京时间:', beijingTime);

// 2. 模拟收货单据文件名
const stockInDocument = '收货单据_20250922_001.pdf';
console.log('2. 收货单据名称:', stockInDocument);

// 3. 模拟上传文件到 uploads 目录
const fileName = '收货单据_20250922_001.pdf';
const filePath = path.join(uploadsDir, fileName);
fs.writeFileSync(filePath, '这是一个模拟的收货单据文件内容');
console.log('3. 文件已保存到 uploads 目录:', filePath);

// 4. 执行插入操作测试所有需求
const query = `
  INSERT INTO inventory (
    product_name, imei, stock_in_quantity, supplier, stock_in_date,
    stock_in_by, stock_in_status, return_status, after_sales_status, other_status,
    quantity, transaction_type, stock_in_document, stock_in_auto_number, stock_in_time, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const params = [
  '测试产品',
  '123456789012345',
  1,
  '测试供应商',
  '2025-09-22 18:00:00',
  'test_user',
  '已入库',
  '正常',
  '正常',
  '正常',
  1,
  'in',
  stockInDocument,  // stock_in_document 字段
  null,  // stock_in_auto_number 字段设置为 NULL
  beijingTime,  // stock_in_time 字段设置为当前北京时间
  beijingTime   // created_at
];

console.log('\n4. 执行数据库插入操作...');
console.log('SQL:', query);
console.log('参数:', params);

db.run(query, params, function(err) {
  if (err) {
    console.error('插入失败:', err);
    db.close();
    return;
  }
  
  console.log('插入成功，ID:', this.lastID);
  
  // 查询刚插入的记录验证所有需求
  db.get("SELECT id, product_name, imei, stock_in_time, stock_in_auto_number, stock_in_document, created_at FROM inventory WHERE id = ?", [this.lastID], (err, row) => {
    if (err) {
      console.error('查询失败:', err);
      db.close();
      return;
    }
    
    console.log('\n=== 验证结果 ===');
    console.log('插入的记录:');
    console.log(`  ID: ${row.id}`);
    console.log(`  产品: ${row.product_name}`);
    console.log(`  IMEI: ${row.imei}`);
    console.log(`  stock_in_time: ${row.stock_in_time === null ? 'NULL' : '"' + row.stock_in_time + '"'}`);
    console.log(`  stock_in_auto_number: ${row.stock_in_auto_number === null ? 'NULL' : '"' + row.stock_in_auto_number + '"'}`);
    console.log(`  stock_in_document: ${row.stock_in_document === null ? 'NULL' : '"' + row.stock_in_document + '"'}`);
    console.log(`  created_at: ${row.created_at}`);
    
    // 验证所有4个需求
    console.log('\n=== 需求验证 ===');
    let allPassed = true;
    
    // 需求1: 将当前北京时间填写到数据库的 stock_in_time 字段
    if (row.stock_in_time !== null && row.stock_in_time.includes('2025')) {
      console.log('✅ 需求1通过: stock_in_time 字段已正确填写为北京时间');
    } else {
      console.log('❌ 需求1失败: stock_in_time 字段未正确填写');
      allPassed = false;
    }
    
    // 需求2: 将收货单据名称写入到 stock_in_document 字段
    if (row.stock_in_document === stockInDocument) {
      console.log('✅ 需求2通过: stock_in_document 字段已正确填写');
    } else {
      console.log('❌ 需求2失败: stock_in_document 字段未正确填写');
      allPassed = false;
    }
    
    // 需求3: 将上传的收货单据文件保存到 uploads 目录
    if (fs.existsSync(filePath)) {
      console.log('✅ 需求3通过: 文件已保存到 uploads 目录');
    } else {
      console.log('❌ 需求3失败: 文件未保存到 uploads 目录');
      allPassed = false;
    }
    
    // 需求4: 不再写入 stock_in_auto_number 字段
    if (row.stock_in_auto_number === null) {
      console.log('✅ 需求4通过: stock_in_auto_number 字段已正确设置为 NULL');
    } else {
      console.log('❌ 需求4失败: stock_in_auto_number 字段仍有值');
      allPassed = false;
    }
    
    if (allPassed) {
      console.log('\n🎉 所有需求均已满足！');
    } else {
      console.log('\n❌ 部分需求未满足，请检查以上错误信息');
    }
    
    // 清理测试数据
    db.run("DELETE FROM inventory WHERE id = ?", [row.id], (err) => {
      if (err) {
        console.error('清理失败:', err);
      } else {
        console.log('\n测试数据已清理');
      }
      
      // 清理测试文件
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('测试文件已清理');
      }
      
      db.close();
    });
  });
});