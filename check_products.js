const { executeQuery } = require('./backend/config/database');

async function checkProducts() {
  try {
    // 初始化数据库
    const { initDatabase } = require('./backend/config/database');
    await initDatabase();
    
    // 查询产品总数
    const result = await executeQuery('SELECT COUNT(*) as count FROM products');
    console.log('产品总数:', result.data[0].count);
    
    // 查询所有产品
    const products = await executeQuery('SELECT * FROM products');
    console.log('产品列表:');
    products.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.model})`);
    });
  } catch (error) {
    console.error('检查产品时出错:', error);
  }
}

checkProducts();