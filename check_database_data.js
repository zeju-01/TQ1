// 检查数据库中实际数据的脚本
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('成功连接到数据库');
  }
});

// 查询函数
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// 检查数据
async function checkData() {
  try {
    console.log('检查数据库中的入库数据...');
    
    // 1. 检查所有入库记录
    const allRecords = await query('SELECT * FROM inventory WHERE stock_in_number IS NOT NULL AND stock_in_number != "" LIMIT 10');
    console.log('\n1. 前10条入库记录:');
    console.log(allRecords);
    
    // 2. 检查包含"合同编号1"的记录
    const contractRecords = await query('SELECT * FROM inventory WHERE stock_in_contract_number LIKE ? AND stock_in_number IS NOT NULL AND stock_in_number != ""', ['%合同编号1%']);
    console.log('\n2. 包含"合同编号1"的入库记录:');
    console.log(contractRecords);
    
    // 3. 检查所有不同的合同编号
    const contractNumbers = await query('SELECT DISTINCT stock_in_contract_number FROM inventory WHERE stock_in_contract_number IS NOT NULL AND stock_in_contract_number != ""');
    console.log('\n3. 所有不同的合同编号:');
    console.log(contractNumbers);
    
    // 4. 检查所有不同的入库单号
    const stockInNumbers = await query('SELECT DISTINCT stock_in_number FROM inventory WHERE stock_in_number IS NOT NULL AND stock_in_number != ""');
    console.log('\n4. 所有不同的入库单号:');
    console.log(stockInNumbers);
    
    // 5. 特别检查合同编号为"合同编号1"的入库单号
    const specificContractRecords = await query('SELECT DISTINCT stock_in_number FROM inventory WHERE stock_in_contract_number = ?', ['合同编号1']);
    console.log('\n5. 合同编号为"合同编号1"的入库单号:');
    console.log(specificContractRecords);
    
  } catch (error) {
    console.error('检查数据时出错:', error.message);
  } finally {
    db.close();
  }
}

// 运行检查
checkData();