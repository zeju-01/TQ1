// 最终验证时间修复结果
const { executeQuery } = require('./config/database');
const { initDatabase } = require('./config/database');

async function finalVerification() {
  try {
    console.log('=== 最终验证时间修复结果 ===');
    
    // 初始化数据库
    await initDatabase();
    
    // 查询所有记录，检查时间格式和合理性
    const query = `
      SELECT id, product_name, stock_in_time, created_at 
      FROM inventory 
      WHERE stock_in_time IS NOT NULL
      ORDER BY id DESC
      LIMIT 10
    `;
    
    const result = await executeQuery(query);
    
    if (result.success) {
      console.log('最新的10条记录时间验证:');
      
      let allValid = true;
      
      result.data.forEach(record => {
        console.log(`  ID: ${record.id}`);
        console.log(`    产品名称: ${record.product_name}`);
        console.log(`    入库时间: ${record.stock_in_time}`);
        console.log(`    创建时间: ${record.created_at}`);
        
        // 验证时间格式
        const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!timeRegex.test(record.stock_in_time)) {
          console.log(`    ❌ 时间格式错误`);
          allValid = false;
        } else {
          console.log(`    ✅ 时间格式正确`);
        }
        
        // 验证时间合理性（小时应该在合理范围内，不是UTC时间）
        const timeParts = record.stock_in_time.split(' ')[1].split(':');
        const hour = parseInt(timeParts[0]);
        
        // 北京时间小时应该在0-23之间，但不应该太小（小于6可能是UTC时间）
        if (hour < 6) {
          console.log(`    ⚠️  时间可能仍有问题，小时数 ${hour} 偏小`);
          allValid = false;
        } else {
          console.log(`    ✅ 时间合理性检查通过`);
        }
        
        console.log();
      });
      
      if (allValid) {
        console.log('✅ 所有时间数据验证通过！');
      } else {
        console.log('❌ 部分时间数据仍存在问题');
      }
    } else {
      console.error('查询失败:', result.error);
    }
    
    console.log('=== 最终验证完成 ===');
  } catch (error) {
    console.error('验证过程中出错:', error);
  }
}

// 运行最终验证
finalVerification();