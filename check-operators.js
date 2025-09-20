const { executeQuery } = require('./backend/config/database');

async function checkOperators() {
  try {
    // 初始化数据库
    const { initDatabase } = require('./backend/config/database');
    await initDatabase();
    
    // 查询运营商总数
    const countResult = await executeQuery('SELECT COUNT(*) as count FROM operators');
    console.log('运营商总数:', countResult.data[0].count);
    
    // 查询所有运营商
    const operators = await executeQuery('SELECT * FROM operators ORDER BY name');
    console.log('运营商列表:');
    operators.data.forEach((operator, index) => {
      console.log(`${index + 1}. ${operator.name} (${operator.code || '无代码'})`);
    });
    
    // 查询去重后的运营商名称
    const distinctOperators = await executeQuery('SELECT DISTINCT name FROM operators ORDER BY name');
    console.log('\n去重后的运营商名称:');
    distinctOperators.data.forEach((operator, index) => {
      console.log(`${index + 1}. ${operator.name}`);
    });
  } catch (error) {
    console.error('检查运营商时出错:', error);
  }
}

checkOperators();