const fs = require('fs');
const path = require('path');

// 模拟后端CSV解析逻辑
function parseCSV(csvData) {
  let jsonData = [];
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) {
    console.log('CSV文件为空');
    return jsonData;
  }
  
  // 解析CSV头部
  const headers = lines[0].split(',').map(header => header.trim());
  console.log('解析的头部字段:', headers);
  
  // 解析数据行
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        // 处理可能被引号包围的值
        let value = values[index];
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        row[header] = value;
      });
      jsonData.push(row);
    }
  }
  
  return jsonData;
}

// 读取并解析CSV文件
const csvFilePath = path.join(__dirname, 'frontend', '测试Excel导入文件.csv');

if (fs.existsSync(csvFilePath)) {
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  console.log('开始解析CSV文件...\n');
  
  const parsedData = parseCSV(csvData);
  
  console.log('解析结果:');
  console.log('数据行数:', parsedData.length);
  console.log('第一行数据:', parsedData[0]);
  console.log('第二行数据:', parsedData[1]);
  console.log('第三行数据:', parsedData[2]);
  
  // 检查imei字段
  if (parsedData.length > 0) {
    console.log('\n检查imei字段:');
    console.log('第一行imei值:', parsedData[0].imei);
    console.log('imei字段类型:', typeof parsedData[0].imei);
    
    // 检查所有字段
    console.log('\n第一行所有字段:');
    for (const key in parsedData[0]) {
      console.log(`  ${key}: ${parsedData[0][key]} (类型: ${typeof parsedData[0][key]})`);
    }
  }
} else {
  console.log('CSV文件不存在:', csvFilePath);
}