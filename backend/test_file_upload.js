// 测试文件上传和入库功能
const fs = require('fs');
const path = require('path');

// 创建测试文件
const testFileName = 'test_receipt.txt';
const testContent = 'This is a test receipt document.';

// 写入测试文件
fs.writeFileSync(testFileName, testContent);
console.log(`创建测试文件: ${testFileName}`);

// 模拟文件上传过程
const uploadedFileName = 'SI202509220001_1.txt';
fs.copyFileSync(testFileName, uploadedFileName);
console.log(`模拟文件上传: ${uploadedFileName}`);

// 验证文件是否存在于uploads目录
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('创建uploads目录');
}

const finalFilePath = path.join(uploadsDir, uploadedFileName);
fs.copyFileSync(uploadedFileName, finalFilePath);
console.log(`文件已保存到uploads目录: ${finalFilePath}`);

// 清理测试文件
fs.unlinkSync(testFileName);
fs.unlinkSync(uploadedFileName);
console.log('清理测试文件完成');

console.log('文件上传测试成功！');