const fs = require('fs');
const path = require('path');

console.log('验证修复后的功能...');

// 检查数据库时区设置
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();

async function verifyDatabaseTimezone() {
  try {
    const db = await open({
      filename: path.join(__dirname, 'data', 'inventory.db'),
      driver: sqlite3.Database
    });

    const tableInfo = await db.all("PRAGMA table_info(inventory)");
    const timeColumns = tableInfo.filter(col => 
      col.name.includes('_time') || col.name.includes('_date') || col.name === 'created_at' || col.name === 'updated_at'
    );

    console.log('数据库时间字段设置:');
    let allCorrect = true;
    timeColumns.forEach(col => {
      console.log(`- ${col.name}: ${col.dflt_value || 'NULL'}`);
      if (col.dflt_value && !col.dflt_value.includes('+8 hours')) {
        console.log(`  WARNING: 字段 ${col.name} 可能没有正确设置时区`);
        allCorrect = false;
      }
    });

    if (allCorrect) {
      console.log('✓ 数据库时区设置正确');
    } else {
      console.log('✗ 数据库时区设置可能有问题');
    }

    await db.close();
  } catch (error) {
    console.error('检查数据库时区时出错:', error);
  }
}

// 检查文件上传功能
function verifyFileUpload() {
  const uploadDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    console.log('上传目录中的文件:');
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      console.log(`- ${file} (${(stats.size / 1024).toFixed(2)}KB)`);
    });
    
    if (files.length > 0) {
      console.log('✓ 文件上传功能正常');
    } else {
      console.log('⚠ 上传目录为空');
    }
  } else {
    console.log('✗ 上传目录不存在');
  }
}

// 检查最近的数据库记录
async function verifyDatabaseRecords() {
  try {
    const db = await open({
      filename: path.join(__dirname, 'data', 'inventory.db'),
      driver: sqlite3.Database
    });

    // 检查最近的5条记录
    const recentRecords = await db.all('SELECT id, stock_in_document, created_at, stock_in_date FROM inventory ORDER BY id DESC LIMIT 5');
    console.log('最近的库存记录:');
    recentRecords.forEach(record => {
      console.log(`- ID: ${record.id}, 文件: ${record.stock_in_document || '无'}, 创建时间: ${record.created_at}, 入库时间: ${record.stock_in_date}`);
    });

    await db.close();
  } catch (error) {
    console.error('检查数据库记录时出错:', error);
  }
}

// 执行所有验证
async function runAllVerifications() {
  console.log('开始验证修复后的功能...\n');
  
  verifyFileUpload();
  console.log();
  
  await verifyDatabaseTimezone();
  console.log();
  
  await verifyDatabaseRecords();
  console.log();
  
  console.log('验证完成。');
}

runAllVerifications();