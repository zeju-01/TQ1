// 调试前端请求中是否包含 stock_in_auto_number 字段
const fs = require('fs');
const path = require('path');

console.log('调试前端请求中是否包含 stock_in_auto_number 字段...\n');

// 检查前端服务文件
console.log('1. 检查前端服务文件...');
const servicePath = path.join(__dirname, 'frontend', 'src', 'services', 'inventory.ts');
if (fs.existsSync(servicePath)) {
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  // 检查 stockIn 函数
  const stockInMatch = serviceContent.match(/export const stockIn[^}]+handleSingleUpload/s);
  if (stockInMatch) {
    const stockInFunction = stockInMatch[0];
    console.log('   stockIn 函数中是否包含 stock_in_auto_number:');
    if (stockInFunction.includes('stock_in_auto_number')) {
      console.log('     ✅ 是');
      // 查找具体的行号
      const lines = stockInFunction.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('stock_in_auto_number')) {
          console.log(`       行 ${index + 1}: ${line.trim()}`);
        }
      });
    } else {
      console.log('     ❌ 否');
    }
  }
  
  // 检查 batchStockIn 函数
  const batchStockInMatch = serviceContent.match(/export const batchStockIn[^}]+handleMultipleUpload/s);
  if (batchStockInMatch) {
    const batchStockInFunction = batchStockInMatch[0];
    console.log('   batchStockIn 函数中是否包含 stock_in_auto_number:');
    if (batchStockInFunction.includes('stock_in_auto_number')) {
      console.log('     ✅ 是');
      // 查找具体的行号
      const lines = batchStockInFunction.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('stock_in_auto_number')) {
          console.log(`       行 ${index + 1}: ${line.trim()}`);
        }
      });
    } else {
      console.log('     ❌ 否');
    }
  }
} else {
  console.log('   ❌ 未找到前端服务文件');
}

// 检查前端组件文件
console.log('\n2. 检查前端组件文件...');
const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');
function checkDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      checkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('stock_in_auto_number')) {
        console.log(`   ${filePath} 中包含 stock_in_auto_number`);
        // 查找具体的行号
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('stock_in_auto_number')) {
            console.log(`     行 ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });
}

checkDirectory(componentsDir);

// 检查页面文件
console.log('\n3. 检查页面文件...');
const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
checkDirectory(pagesDir);

console.log('\n调试完成！');