const { executeQuery } = require('./config/database');

async function checkDatabase() {
  try {
    // 初始化数据库
    const dbModule = require('./config/database');
    await dbModule.initDatabase();
    
    // 查询最近的5条记录
    const result = await executeQuery(
      'SELECT id, stock_in_number, stock_in_document, created_at FROM inventory ORDER BY id DESC LIMIT 5'
    );
    
    console.log('最近的5条入库记录:');
    console.log('=================================');
    if (result.success) {
      result.data.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id}`);
        console.log(`   入库单号: ${record.stock_in_number}`);
        console.log(`   收货单据: ${record.stock_in_document || '无'}`);
        console.log(`   创建时间: ${record.created_at}`);
        console.log('---------------------------------');
      });
    } else {
      console.error('查询失败:', result.error);
    }
    
    // 检查上传目录中的文件
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(__dirname, 'uploads');
    
    console.log('\n上传目录中的文件:');
    console.log('=================================');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      if (files.length > 0) {
        files.forEach((file, index) => {
          const filePath = path.join(uploadDir, file);
          const stats = fs.statSync(filePath);
          console.log(`${index + 1}. ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        });
      } else {
        console.log('上传目录为空');
      }
    } else {
      console.log('上传目录不存在');
    }
  } catch (error) {
    console.error('检查数据库时出错:', error);
  }
}

checkDatabase();