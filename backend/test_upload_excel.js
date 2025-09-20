const XLSX = require('xlsx');
const path = require('path');

// Excel文件路径
const excelFilePath = path.join(__dirname, '00天猫吹风机（无刷卡）移动版-0810-40pcs.xlsx');

try {
  console.log('正在读取Excel文件:', excelFilePath);
  
  // 读取Excel文件
  const workbook = XLSX.readFile(excelFilePath, {cellDates: true});
  
  console.log('工作簿信息:');
  console.log('- 工作表数量:', workbook.SheetNames.length);
  console.log('- 工作表名称:', workbook.SheetNames);
  
  // 获取第一个工作表
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  console.log('\n第一个工作表信息:');
  console.log('- 工作表名称:', sheetName);
  
  // 转换为JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {raw: false, dateNF: 'yyyy-mm-dd hh:mm:ss'});
  
  console.log('\n数据行数:', jsonData.length);
  
  if (jsonData.length > 0) {
    console.log('\n前5行数据:');
    const displayRows = Math.min(5, jsonData.length);
    for (let i = 0; i < displayRows; i++) {
      console.log(`第${i + 1}行:`, JSON.stringify(jsonData[i], null, 2));
    }
    
    // 检查字段
    console.log('\n字段检查:');
    const firstRow = jsonData[0];
    console.log('所有字段名:', Object.keys(firstRow));
    
    // 检查关键字段
    const keyFields = ['imei', 'IMEI', '产品名称', 'product_name', '数量', 'quantity'];
    keyFields.forEach(field => {
      if (firstRow.hasOwnProperty(field)) {
        console.log(`✓ 包含字段 "${field}":`, firstRow[field]);
      } else {
        console.log(`✗ 不包含字段 "${field}"`);
      }
    });
  } else {
    console.log('Excel文件为空');
  }
} catch (error) {
  console.error('读取Excel文件时出错:', error.message);
}