const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 创建工作簿
const workbook = XLSX.utils.book_new();

// 创建示例数据，使用与前端模板一致的中文字段名
const data = [
  ['IMEI号', '产品名称', '产品型号', '运营商', '箱号', '工厂工单', '数量', '合同编号', '入库单号', '入库时间', '供应商', '备注'],
  ['123456789012345', '天猫吹风机', 'TmallHairDryer-001', '中国移动', 'BOX001', 'FACTORY001', 1, 'CONTRACT001', 'SI202509180001', '2025-09-18 10:00:00', '供应商A', '备注示例A'],
  ['234567890123456', '天猫吹风机', 'TmallHairDryer-001', '中国联通', 'BOX002', 'FACTORY002', 2, 'CONTRACT002', 'SI202509180002', '2025-09-18 11:00:00', '供应商B', '备注示例B'],
  ['345678901234567', '天猫吹风机', 'TmallHairDryer-001', '中国电信', 'BOX003', 'FACTORY003', 3, 'CONTRACT003', 'SI202509180003', '2025-09-18 12:00:00', '供应商C', '备注示例C']
];

// 创建工作表
const worksheet = XLSX.utils.aoa_to_sheet(data);

// 将工作表添加到工作簿
XLSX.utils.book_append_sheet(workbook, worksheet, '入库模板');

// 生成Excel文件
const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

// 保存文件
const fileName = '测试Excel导入文件.xlsx';
const filePath = path.join(__dirname, fileName);

fs.writeFileSync(filePath, excelBuffer);

console.log(`Excel文件已创建: ${filePath}`);