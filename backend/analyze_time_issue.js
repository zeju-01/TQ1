// 分析时间问题
const { executeQuery } = require('./config/database');
const { initDatabase } = require('./config/database');

async function analyzeTimeIssue() {
  try {
    console.log('=== 分析时间问题 ===');
    
    // 初始化数据库
    await initDatabase();
    
    // 查询所有记录，按ID排序
    const query = `
      SELECT id, product_name, stock_in_time, created_at 
      FROM inventory 
      ORDER BY id ASC
    `;
    
    const result = await executeQuery(query);
    
    if (result.success) {
      console.log('所有库存记录的时间数据:');
      let issueCount = 0;
      
      result.data.forEach(record => {
        console.log(`  ID: ${record.id}`);
        console.log(`    产品名称: ${record.product_name}`);
        console.log(`    入库时间: ${record.stock_in_time}`);
        console.log(`    创建时间: ${record.created_at}`);
        
        // 检查时间是否可能是UTC时间（小时数较小）
        if (record.stock_in_time) {
          const timeParts = record.stock_in_time.split(' ')[1].split(':');
          const hour = parseInt(timeParts[0]);
          
          // 如果小时数小于8，可能是UTC时间而非北京时间
          if (hour < 8) {
            console.log(`    ❌ 可能的时间问题: 小时数 ${hour} 可能是UTC时间而非北京时间`);
            issueCount++;
          }
        }
        
        console.log();
      });
      
      console.log(`发现 ${issueCount} 条可能存在问题的记录`);
    } else {
      console.error('查询失败:', result.error);
    }
    
    console.log('=== 分析完成 ===');
  } catch (error) {
    console.error('分析过程中出错:', error);
  }
}

// 运行分析
analyzeTimeIssue();