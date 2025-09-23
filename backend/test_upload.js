const fs = require('fs');
const path = require('path');

// 创建一个测试文件
const testContent = '这是一个测试文件内容';
const testFilePath = path.join(__dirname, 'test_file.txt');

fs.writeFileSync(testFilePath, testContent);
console.log('创建测试文件:', testFilePath);

// 模拟文件上传的处理逻辑
const originalFilename = 'test_file.txt';
const fileExtension = originalFilename.split('.').pop();
const newFilename = `SI202509220001_1.${fileExtension}`;
const uploadDir = path.join(__dirname, 'uploads');
const finalPath = path.join(uploadDir, newFilename);

console.log('原始文件名:', originalFilename);
console.log('新文件名:', newFilename);
console.log('上传目录:', uploadDir);
console.log('最终路径:', finalPath);

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('创建上传目录');
}

// 移动文件到上传目录
fs.copyFileSync(testFilePath, finalPath);
console.log('文件上传成功');

// 清理测试文件
fs.unlinkSync(testFilePath);
console.log('清理测试文件');

console.log('文件上传测试完成');