// 测试Excel文件上传API
const fs = require('fs');
const path = require('path');

// 检查文件是否存在
const filePath = path.join(__dirname, '00天猫吹风机（无刷卡）移动版-0810-40pcs.xlsx');

if (fs.existsSync(filePath)) {
  console.log('文件存在:', filePath);
  const stats = fs.statSync(filePath);
  console.log('文件大小:', stats.size, '字节');
  
  // 获取文件扩展名
  const ext = path.extname(filePath).toLowerCase();
  console.log('文件扩展名:', ext);
  
  // 检查是否为支持的文件类型
  const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'jpg', 'jpeg', 'png', 'gif'];
  const fileExt = ext.slice(1); // 移除点号
  
  if (allowedTypes.includes(fileExt)) {
    console.log('✓ 文件类型支持');
  } else {
    console.log('✗ 文件类型不支持');
  }
} else {
  console.log('文件不存在:', filePath);
}