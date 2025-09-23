// 验证入库功能实现
const fs = require('fs');
const path = require('path');

console.log('验证入库功能实现...\n');

// 1. 检查后端模型实现
console.log('1. 检查后端模型实现...');
const modelPath = path.join(__dirname, 'backend', 'models', 'Inventory.js');
if (fs.existsSync(modelPath)) {
  const modelContent = fs.readFileSync(modelPath, 'utf8');
  const hasStockInTime = modelContent.includes('stock_in_time') && modelContent.includes('beijingTime');
  const hasStockInDocument = modelContent.includes('stock_in_document');
  const hasStockInAutoNumber = !modelContent.includes('stock_in_auto_number');
  
  console.log(`   stock_in_time 处理: ${hasStockInTime ? '✅' : '❌'}`);
  console.log(`   stock_in_document 处理: ${hasStockInDocument ? '✅' : '❌'}`);
  console.log(`   stock_in_auto_number 不写入: ${hasStockInAutoNumber ? '✅' : '❌'}`);
} else {
  console.log('   ❌ 未找到 Inventory.js 模型文件');
}

// 2. 检查数据库配置
console.log('\n2. 检查数据库配置...');
const dbConfigPath = path.join(__dirname, 'backend', 'config', 'database.js');
if (fs.existsSync(dbConfigPath)) {
  const dbConfigContent = fs.readFileSync(dbConfigPath, 'utf8');
  const hasStockInTimeDefault = dbConfigContent.includes('stock_in_time DATETIME DEFAULT (datetime(\'now\', \'+8 hours\'))');
  const hasStockInDocumentField = dbConfigContent.includes('stock_in_document VARCHAR(100)');
  const hasStockInAutoNumberOptional = dbConfigContent.includes('stock_in_auto_number VARCHAR(50),  -- 已废弃，不再使用');
  
  console.log(`   stock_in_time 默认值: ${hasStockInTimeDefault ? '✅' : '❌'}`);
  console.log(`   stock_in_document 字段: ${hasStockInDocumentField ? '✅' : '❌'}`);
  console.log(`   stock_in_auto_number 已废弃: ${hasStockInAutoNumberOptional ? '✅' : '❌'}`);
} else {
  console.log('   ❌ 未找到 database.js 配置文件');
}

// 3. 检查前端实现
console.log('\n3. 检查前端实现...');
const frontendTypesPath = path.join(__dirname, 'frontend', 'src', 'types', 'index.ts');
if (fs.existsSync(frontendTypesPath)) {
  const frontendTypesContent = fs.readFileSync(frontendTypesPath, 'utf8');
  const hasStockInTimeField = frontendTypesContent.includes('stock_in_time?: string;');
  const hasStockInDocumentField = frontendTypesContent.includes('stock_in_document?: string;');
  const hasStockInAutoNumberField = !frontendTypesContent.includes('stock_in_auto_number?: string;');
  
  console.log(`   stock_in_time 类型定义: ${hasStockInTimeField ? '✅' : '❌'}`);
  console.log(`   stock_in_document 类型定义: ${hasStockInDocumentField ? '✅' : '❌'}`);
  console.log(`   stock_in_auto_number 已移除: ${hasStockInAutoNumberField ? '✅' : '❌'}`);
} else {
  console.log('   ❌ 未找到前端类型定义文件');
}

// 4. 检查前端服务实现
console.log('\n4. 检查前端服务实现...');
const frontendServicePath = path.join(__dirname, 'frontend', 'src', 'services', 'inventory.ts');
if (fs.existsSync(frontendServicePath)) {
  const frontendServiceContent = fs.readFileSync(frontendServicePath, 'utf8');
  const hasStockInTimeHandling = frontendServiceContent.includes('stock_in_time') && frontendServiceContent.includes('stock_in_date');
  const hasStockInDocumentHandling = frontendServiceContent.includes('stock_in_document');
  const hasStockInAutoNumberHandling = !frontendServiceContent.includes('stock_in_auto_number');
  
  console.log(`   stock_in_time 处理: ${hasStockInTimeHandling ? '✅' : '❌'}`);
  console.log(`   stock_in_document 处理: ${hasStockInDocumentHandling ? '✅' : '❌'}`);
  console.log(`   stock_in_auto_number 已移除: ${hasStockInAutoNumberHandling ? '✅' : '❌'}`);
} else {
  console.log('   ❌ 未找到前端服务文件');
}

// 5. 检查数据库表结构
console.log('\n5. 检查数据库表结构...');
const initSqlPath = path.join(__dirname, 'database', 'init.sql');
if (fs.existsSync(initSqlPath)) {
  const initSqlContent = fs.readFileSync(initSqlPath, 'utf8');
  const hasStockInTimeColumn = initSqlContent.includes('`stock_in_time` TIMESTAMP');
  const hasStockInDocumentColumn = initSqlContent.includes('`stock_in_document` VARCHAR(100)');
  const hasStockInAutoNumberComment = initSqlContent.includes('`stock_in_auto_number` VARCHAR(50) NULL COMMENT \'系统自动编号（已废弃）\'');
  
  console.log(`   stock_in_time 字段: ${hasStockInTimeColumn ? '✅' : '❌'}`);
  console.log(`   stock_in_document 字段: ${hasStockInDocumentColumn ? '✅' : '❌'}`);
  console.log(`   stock_in_auto_number 已标记为废弃: ${hasStockInAutoNumberComment ? '✅' : '❌'}`);
} else {
  console.log('   ❌ 未找到数据库初始化脚本');
}

console.log('\n验证完成！');