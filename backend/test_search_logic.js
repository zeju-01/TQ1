// 测试搜索逻辑的后端脚本
const { executeQuery } = require('./config/database');

async function testSearchLogic() {
  try {
    console.log('测试搜索逻辑...');
    
    // 测试1: 检查数据库连接
    console.log('\n1. 测试数据库连接:');
    try {
      const testResult = await executeQuery('SELECT 1 as test');
      console.log('数据库连接成功:', testResult);
    } catch (error) {
      console.log('数据库连接失败:', error.message);
      return;
    }
    
    // 测试2: 检查合同编号字段是否存在
    console.log('\n2. 检查表结构:');
    try {
      const schemaResult = await executeQuery("PRAGMA table_info(inventory)");
      const contractColumn = schemaResult.data.find(col => col.name === 'stock_in_contract_number');
      console.log('合同编号字段信息:', contractColumn);
    } catch (error) {
      console.log('检查表结构失败:', error.message);
    }
    
    // 测试3: 执行实际的搜索查询
    console.log('\n3. 执行搜索查询:');
    const queries = [
      {
        name: '合同编号包含"合同编号1"',
        query: 'SELECT DISTINCT stock_in_number FROM inventory WHERE stock_in_contract_number LIKE ? AND stock_in_number IS NOT NULL AND stock_in_number != ""',
        params: ['%合同编号1%']
      },
      {
        name: '合同编号等于"合同编号1"',
        query: 'SELECT DISTINCT stock_in_number FROM inventory WHERE stock_in_contract_number = ? AND stock_in_number IS NOT NULL AND stock_in_number != ""',
        params: ['合同编号1']
      },
      {
        name: '所有合同编号',
        query: 'SELECT DISTINCT stock_in_contract_number FROM inventory WHERE stock_in_contract_number IS NOT NULL AND stock_in_contract_number != ""'
      }
    ];
    
    for (const test of queries) {
      console.log(`\n测试: ${test.name}`);
      console.log('查询:', test.query);
      console.log('参数:', test.params);
      
      try {
        const result = await executeQuery(test.query, test.params || []);
        console.log('结果:', result.data);
      } catch (error) {
        console.log('查询失败:', error.message);
      }
    }
    
  } catch (error) {
    console.error('测试过程中出现错误:', error.message);
  }
}

// 运行测试
testSearchLogic();