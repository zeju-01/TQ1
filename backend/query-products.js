const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function queryProducts() {
  try {
    // 打开数据库连接
    const db = await open({
      filename: path.join(__dirname, 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 查询产品数据
    const products = await db.all(
      'SELECT id, name, created_at FROM products ORDER BY id LIMIT 5'
    );
    
    console.log('产品创建时间:');
    products.forEach(product => {
      console.log(`ID: ${product.id}, 名称: ${product.name}, 创建时间: ${product.created_at}`);
    });
    
    // 关闭数据库连接
    await db.close();
  } catch (error) {
    console.error('查询数据库失败:', error);
  }
}

queryProducts();