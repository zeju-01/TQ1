// 检查数据库中 stock_in_document 字段的脚本
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');

// 连接到数据库
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
});

// 查询包含 stock_in_document 字段的记录
function checkStockInDocuments() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        id,
        product_name,
        stock_in_number,
        stock_in_document,
        stock_in_date,
        stock_in_by
      FROM inventory 
      WHERE stock_in_document IS NOT NULL AND stock_in_document != ''
      ORDER BY stock_in_date DESC
      LIMIT 10
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('=== 最近的入库记录 (包含 stock_in_document) ===');
      if (rows.length === 0) {
        console.log('没有找到包含 stock_in_document 的记录');
      } else {
        rows.forEach((row, index) => {
          console.log(`\n记录 ${index + 1}:`);
          console.log(`  ID: ${row.id}`);
          console.log(`  产品名称: ${row.product_name}`);
          console.log(`  入库单号: ${row.stock_in_number}`);
          console.log(`  入库单据: ${row.stock_in_document}`);
          console.log(`  入库时间: ${row.stock_in_date}`);
          console.log(`  操作用户: ${row.stock_in_by}`);
        });
      }
      
      resolve(rows);
    });
  });
}

// 查询所有最近的入库记录
function checkAllRecentStockIns() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        id,
        product_name,
        stock_in_number,
        stock_in_document,
        stock_in_date,
        stock_in_by
      FROM inventory 
      ORDER BY stock_in_date DESC
      LIMIT 10
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n=== 最近的所有入库记录 ===');
      if (rows.length === 0) {
        console.log('没有找到入库记录');
      } else {
        rows.forEach((row, index) => {
          const hasDocument = row.stock_in_document && row.stock_in_document.trim() !== '';
          console.log(`\n记录 ${index + 1}:`);
          console.log(`  ID: ${row.id}`);
          console.log(`  产品名称: ${row.product_name}`);
          console.log(`  入库单号: ${row.stock_in_number}`);
          console.log(`  入库单据: ${row.stock_in_document || '(空)'}`);
          console.log(`  入库时间: ${row.stock_in_date}`);
          console.log(`  操作用户: ${row.stock_in_by}`);
          console.log(`  是否有单据: ${hasDocument ? '是' : '否'}`);
        });
      }
      
      resolve(rows);
    });
  });
}

// 统计信息
function getStatistics() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN stock_in_document IS NOT NULL AND stock_in_document != '' THEN 1 END) as records_with_document,
        COUNT(CASE WHEN stock_in_document IS NULL OR stock_in_document = '' THEN 1 END) as records_without_document
      FROM inventory
    `;
    
    db.get(sql, [], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n=== 统计信息 ===');
      console.log(`总入库记录数: ${row.total_records}`);
      console.log(`包含入库单据的记录数: ${row.records_with_document}`);
      console.log(`不包含入库单据的记录数: ${row.records_without_document}`);
      console.log(`入库单据覆盖率: ${((row.records_with_document / row.total_records) * 100).toFixed(2)}%`);
      
      resolve(row);
    });
  });
}

// 主函数
async function main() {
  console.log('=== 检查 stock_in_document 字段数据 ===\n');
  
  try {
    // 检查包含 stock_in_document 的记录
    await checkStockInDocuments();
    
    // 检查所有最近的入库记录
    await checkAllRecentStockIns();
    
    // 获取统计信息
    await getStatistics();
    
    console.log('\n=== 检查完成 ===');
  } catch (error) {
    console.error('检查过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接时发生错误:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

// 执行主函数
main();