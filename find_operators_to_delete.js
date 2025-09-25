const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 要删除的运营商和产品型号
const operatorsToDelete = ['中国联通', '中国移动', '测试运营商', '直接测试运营商', '完整流程测试运营商'];
const productModelsToDelete = ['EC600U-CN'];

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  // 查找要删除的运营商记录
  const operatorPlaceholders = operatorsToDelete.map(() => '?').join(',');
  const operatorQuery = `SELECT id, product_name, product_model, operator, imei, stock_in_number, stock_in_date, created_at FROM inventory WHERE operator IN (${operatorPlaceholders}) ORDER BY operator, created_at`;
  
  db.all(operatorQuery, operatorsToDelete, (err, rows) => {
    if (err) {
      console.error('查询运营商记录失败:', err.message);
      return;
    }
    
    console.log('找到以下要删除的运营商记录:');
    if (rows.length === 0) {
      console.log('没有找到匹配的运营商记录');
    } else {
      // 按运营商分组显示
      const grouped = {};
      rows.forEach(row => {
        if (!grouped[row.operator]) {
          grouped[row.operator] = [];
        }
        grouped[row.operator].push(row);
      });
      
      for (const operator in grouped) {
        console.log(`\n运营商: ${operator}`);
        grouped[operator].forEach((row, index) => {
          console.log(`  ${index + 1}. ID: ${row.id}, 产品: ${row.product_name || 'N/A'}, 型号: ${row.product_model || 'N/A'}, IMEI: ${row.imei || 'N/A'}, 入库单号: ${row.stock_in_number || 'N/A'}, 入库日期: ${row.stock_in_date}, 创建时间: ${row.created_at}`);
        });
      }
      
      console.log(`\n运营商记录总数: ${rows.length} 条`);
    }
    
    // 查找要删除的产品型号记录
    const modelPlaceholders = productModelsToDelete.map(() => '?').join(',');
    const modelQuery = `SELECT id, product_name, product_model, operator, imei, stock_in_number, stock_in_date, created_at FROM inventory WHERE product_model IN (${modelPlaceholders}) ORDER BY product_model, created_at`;
    
    db.all(modelQuery, productModelsToDelete, (err, rows) => {
      if (err) {
        console.error('查询产品型号记录失败:', err.message);
        return;
      }
      
      console.log('\n找到以下要删除的产品型号记录:');
      if (rows.length === 0) {
        console.log('没有找到匹配的产品型号记录');
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
            console.log(`  ${index + 1}. ID: ${row.id}, 产品: ${row.product_name || 'N/A'}, 运营商: ${row.operator || 'N/A'}, IMEI: ${row.imei || 'N/A'}, 入库单号: ${row.stock_in_number || 'N/A'}, 入库日期: ${row.stock_in_date}, 创建时间: ${row.created_at}`);
          });
        }
        
        console.log(`\n产品型号记录总数: ${rows.length} 条`);
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
});