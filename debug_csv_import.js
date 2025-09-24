const fs = require('fs');
const path = require('path');

// 读取CSV文件内容
const csvFilePath = path.join(__dirname, 'frontend', '测试Excel导入文件.csv');

if (fs.existsSync(csvFilePath)) {
  const csvContent = fs.readFileSync(csvFilePath, 'utf8');
  console.log('CSV文件内容:');
  console.log(csvContent);
  
  // 按行分割
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  console.log('\n文件行数:', lines.length);
  
  // 解析头部
  if (lines.length > 0) {
    const headers = lines[0].split(',').map(header => header.trim());
    console.log('\n头部字段:', headers);
    
    // 检查是否有imei字段
    const hasImei = headers.includes('imei');
    console.log('\n是否包含imei字段:', hasImei);
    
    if (!hasImei) {
      // 查找可能的imei相关字段
      const possibleImeiFields = headers.filter(header => 
        header.toLowerCase().includes('imei') || 
        header.includes('IMEI') ||
        header.includes('imei号') ||
        header.includes('IMEI号')
      );
      console.log('可能的IMEI相关字段:', possibleImeiFields);
    }
    
    // 解析数据行
    console.log('\n数据行:');
    for (let i = 1; i < Math.min(4, lines.length); i++) {
      const values = lines[i].split(',').map(value => value.trim());
      console.log(`第${i}行:`, values);
    }
  }
} else {
  console.log('CSV文件不存在:', csvFilePath);
}