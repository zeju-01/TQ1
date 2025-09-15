const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function querySuppliers() {
  try {
    // 打开数据库连接
    const db = await open({
      filename: path.join(__dirname, 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 查询最新的5个供应商
    const suppliers = await db.all(
      'SELECT id, company_name, created_at FROM suppliers ORDER BY id DESC LIMIT 5'
    );
    
    console.log('最新的5个供应商:');
    suppliers.forEach(supplier => {
      console.log(`ID: ${supplier.id}, 公司名称: ${supplier.company_name}, 创建时间: ${supplier.created_at}`);
    });
    
    // 关闭数据库连接
    await db.close();
  } catch (error) {
    console.error('查询数据库失败:', error);
  }
}

querySuppliers();