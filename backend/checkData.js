const { executeQuery } = require('./config/database');

async function checkData() {
  try {
    // 检查包含"合同编号1"的记录
    const query = `SELECT DISTINCT stock_in_contract_number, stock_in_number 
                   FROM inventory 
                   WHERE stock_in_contract_number LIKE '%合同编号1%' 
                   AND stock_in_number IS NOT NULL 
                   AND stock_in_number != ''`;
    
    const result = await executeQuery(query, []);
    
    if (result.success) {
      console.log('找到的记录:');
      console.log(result.data);
    } else {
      console.log('查询失败:', result.error);
    }
  } catch (error) {
    console.error('检查数据时出错:', error);
  }
}

checkData();