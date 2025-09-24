const fs = require('fs');
const path = require('path');

// 创建CSV测试文件
const csvContent = `imei,product_name,product_model,operator,box_number,factory_order,quantity,contract_number,stock_in_number,stock_in_time,supplier
123456789012345,天猫吹风机,TmallHairDryer-001,中国移动,BOX001,FACTORY001,1,CONTRACT001,SI202509180001,2025-09-18 10:00:00,供应商A
234567890123456,天猫吹风机,TmallHairDryer-001,中国联通,BOX002,FACTORY002,2,CONTRACT002,SI202509180002,2025-09-18 11:00:00,供应商B
345678901234567,天猫吹风机,TmallHairDryer-001,中国电信,BOX003,FACTORY003,3,CONTRACT003,SI202509180003,2025-09-18 12:00:00,供应商C`;

// 保存CSV文件
const csvFileName = '测试Excel导入文件.csv';
const csvFilePath = path.join(__dirname, csvFileName);

fs.writeFileSync(csvFilePath, csvContent);

console.log(`CSV测试文件已创建: ${csvFilePath}`);
console.log('现在你可以使用这个文件来测试Excel导入功能');