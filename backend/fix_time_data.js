// 修复数据库中历史数据的时间问题
const { executeQuery, initDatabase } = require('./config/database');
const { parseTimeString } = require('./utils/timeUtils');

async function fixTimeData() {
  try {
    console.log('=== 修复数据库中历史数据的时间问题 ===');
    
    // 初始化数据库
    await initDatabase();
    
    // 查询所有可能存在问题的记录（小时数小于8的记录）
    const query = `
      SELECT id, product_name, stock_in_time, created_at 
      FROM inventory 
      WHERE stock_in_time IS NOT NULL
      ORDER BY id ASC
    `;
    
    const result = await executeQuery(query);
    
    if (result.success) {
      console.log(`找到 ${result.data.length} 条记录需要检查`);
      
      let fixedCount = 0;
      let skippedCount = 0;
      
      for (const record of result.data) {
        // 解析入库时间
        const timeParts = record.stock_in_time.split(' ');
        const datePart = timeParts[0];
        const timePart = timeParts[1];
        const hour = parseInt(timePart.split(':')[0]);
        
        // 如果小时数小于8，很可能是UTC时间
        if (hour < 8) {
          // 将UTC时间转换为北京时间
          // UTC时间格式: YYYY-MM-DD HH:MM:SS
          // 需要加8小时转换为北京时间
          const utcTimeString = record.stock_in_time + 'Z'; // 添加Z表示UTC时间
          const beijingTime = parseTimeString(utcTimeString);
          
          console.log(`修复记录 ID ${record.id}:`);
          console.log(`  产品: ${record.product_name}`);
          console.log(`  原始时间 (UTC): ${record.stock_in_time}`);
          console.log(`  修复后时间 (北京时间): ${beijingTime}`);
          
          // 更新数据库中的时间
          const updateQuery = `
            UPDATE inventory 
            SET stock_in_time = ?, created_at = ?
            WHERE id = ?
          `;
          
          const updateResult = await executeQuery(updateQuery, [beijingTime, beijingTime, record.id]);
          
          if (updateResult.success) {
            console.log(`  ✅ 记录 ID ${record.id} 更新成功`);
            fixedCount++;
          } else {
            console.log(`  ❌ 记录 ID ${record.id} 更新失败: ${updateResult.error}`);
          }
        } else {
          // 小时数>=8，认为已经是北京时间，跳过
          skippedCount++;
        }
      }
      
      console.log(`\n修复完成:`);
      console.log(`  成功修复: ${fixedCount} 条记录`);
      console.log(`  跳过: ${skippedCount} 条记录`);
    } else {
      console.error('查询失败:', result.error);
    }
    
    console.log('=== 修复完成 ===');
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
}

// 运行修复
fixTimeData();