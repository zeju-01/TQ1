const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 要删除的产品型号
const productModelsToDelete = ['BC26', 'EC200U-CN', 'RG500Q-EA', 'M26'];

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  // 查找要删除的产品记录
  const placeholders = productModelsToDelete.map(() => '?').join(',');
  const query = `SELECT id, product_name, product_model, imei, stock_in_number, stock_in_date, created_at FROM inventory WHERE product_model IN (${placeholders}) ORDER BY product_model, created_at`;
  
  db.all(query, productModelsToDelete, (err, rows) => {
    if (err) {
      console.error('查询记录失败:', err.message);
      return;
    }
    
    console.log('找到以下要删除的记录:');
    if (rows.length === 0) {
      console.log('没有找到匹配的记录');
    } else {
      // 按产品型号分组显示
      const grouped = {};
      rows.forEach(row => {
        if (!grouped[row.product_model]) {
          grouped[row.product_model] = [];
        }
        grouped[row.product_model].push(row);
      });
      
      for (const productModel in grouped) {
        console.log(`\n产品型号: ${productModel}`);
        grouped[productModel].forEach((row, index) => {
          console.log(`  ${index + 1}. ID: ${row.id}, 产品: ${row.product_name}, IMEI: ${row.imei || 'N/A'}, 入库单号: ${row.stock_in_number || 'N/A'}, 入库日期: ${row.stock_in_date}, 创建时间: ${row.created_at}`);
        });
      }
      
      console.log(`\n总共找到 ${rows.length} 条记录`);
    }
    
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  });
});