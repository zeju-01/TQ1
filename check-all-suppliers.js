const { executeQuery } = require('./backend/config/database');

async function checkAllSuppliers() {
  try {
    // 初始化数据库
    const { initDatabase } = require('./backend/config/database');
    await initDatabase();
    
    // 查询供应商总数
    const countResult = await executeQuery('SELECT COUNT(*) as count FROM suppliers');
    console.log('供应商总数:', countResult.data[0].count);
    
    // 查询所有供应商
    const suppliers = await executeQuery('SELECT * FROM suppliers ORDER BY company_name');
    console.log('供应商列表:');
    suppliers.data.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.company_name}`);
    });
    
    // 查询去重后的供应商名称
    const distinctSuppliers = await executeQuery('SELECT DISTINCT company_name FROM suppliers ORDER BY company_name');
    console.log('\n去重后的供应商名称:');
    distinctSuppliers.data.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.company_name}`);
    });
  } catch (error) {
    console.error('检查供应商时出错:', error);
  }
}

checkAllSuppliers();