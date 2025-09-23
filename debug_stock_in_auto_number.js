// 调试 stock_in_auto_number 字段写入问题
const fs = require('fs');
const path = require('path');

console.log('调试 stock_in_auto_number 字段写入问题...\n');

// 1. 检查后端控制器是否传递了该字段
console.log('1. 检查后端控制器...');
const controllerPath = path.join(__dirname, 'backend', 'controllers', 'InventoryController.js');
if (fs.existsSync(controllerPath)) {
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  const hasStockInAutoNumber = controllerContent.includes('stock_in_auto_number');
  console.log(`   控制器中是否包含 stock_in_auto_number: ${hasStockInAutoNumber ? '✅ 是' : '❌ 否'}`);
  
  if (hasStockInAutoNumber) {
    // 查找具体的行号
    const lines = controllerContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('stock_in_auto_number')) {
        console.log(`     行 ${index + 1}: ${line.trim()}`);
      }
    });
  }
} else {
  console.log('   ❌ 未找到控制器文件');
}

// 2. 检查后端模型是否处理了该字段
console.log('\n2. 检查后端模型...');
const modelPath = path.join(__dirname, 'backend', 'models', 'Inventory.js');
if (fs.existsSync(modelPath)) {
  const modelContent = fs.readFileSync(modelPath, 'utf8');
  const hasStockInAutoNumber = modelContent.includes('stock_in_auto_number');
  console.log(`   模型中是否包含 stock_in_auto_number: ${hasStockInAutoNumber ? '✅ 是' : '❌ 否'}`);
  
  if (hasStockInAutoNumber) {
    // 查找具体的行号
    const lines = modelContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('stock_in_auto_number')) {
        console.log(`     行 ${index + 1}: ${line.trim()}`);
      }
    });
  }
  
  // 特别检查 SQL 插入语句
  const insertQueryMatch = modelContent.match(/INSERT INTO inventory \([^)]+\)/);
  if (insertQueryMatch) {
    const insertQuery = insertQueryMatch[0];
    const hasFieldInQuery = insertQuery.includes('stock_in_auto_number');
    console.log(`   SQL 插入语句中是否包含 stock_in_auto_number: ${hasFieldInQuery ? '✅ 是' : '❌ 否'}`);
    console.log(`     插入字段: ${insertQuery}`);
  }
} else {
  console.log('   ❌ 未找到模型文件');
}

// 3. 检查前端是否发送了该字段
console.log('\n3. 检查前端服务...');
const servicePath = path.join(__dirname, 'frontend', 'src', 'services', 'inventory.ts');
if (fs.existsSync(servicePath)) {
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  const hasStockInAutoNumber = serviceContent.includes('stock_in_auto_number');
  console.log(`   前端服务中是否包含 stock_in_auto_number: ${hasStockInAutoNumber ? '✅ 是' : '❌ 否'}`);
  
  if (hasStockInAutoNumber) {
    // 查找具体的行号
    const lines = serviceContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('stock_in_auto_number')) {
        console.log(`     行 ${index + 1}: ${line.trim()}`);
      }
    });
  }
} else {
  console.log('   ❌ 未找到前端服务文件');
}

// 4. 检查前端类型定义
console.log('\n4. 检查前端类型定义...');
const typesPath = path.join(__dirname, 'frontend', 'src', 'types', 'index.ts');
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  const hasStockInAutoNumber = typesContent.includes('stock_in_auto_number');
  console.log(`   前端类型定义中是否包含 stock_in_auto_number: ${hasStockInAutoNumber ? '✅ 是' : '❌ 否'}`);
  
  if (hasStockInAutoNumber) {
    // 查找具体的行号
    const lines = typesContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('stock_in_auto_number')) {
        console.log(`     行 ${index + 1}: ${line.trim()}`);
      }
    });
  }
} else {
  console.log('   ❌ 未找到前端类型定义文件');
}

// 5. 检查数据库配置
console.log('\n5. 检查数据库配置...');
const dbConfigPath = path.join(__dirname, 'backend', 'config', 'database.js');
if (fs.existsSync(dbConfigPath)) {
  const dbConfigContent = fs.readFileSync(dbConfigPath, 'utf8');
  const hasStockInAutoNumber = dbConfigContent.includes('stock_in_auto_number');
  console.log(`   数据库配置中是否包含 stock_in_auto_number: ${hasStockInAutoNumber ? '✅ 是' : '❌ 否'}`);
  
  if (hasStockInAutoNumber) {
    // 查找具体的行号
    const lines = dbConfigContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('stock_in_auto_number')) {
        console.log(`     行 ${index + 1}: ${line.trim()}`);
      }
    });
  }
} else {
  console.log('   ❌ 未找到数据库配置文件');
}

console.log('\n调试完成！');