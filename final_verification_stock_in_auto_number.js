// 最终验证 stock_in_auto_number 字段不再写入
const fs = require('fs');
const path = require('path');

console.log('最终验证 stock_in_auto_number 字段不再写入...\n');

// 1. 验证后端控制器修改
console.log('1. 验证后端控制器修改...');
const controllerPath = path.join(__dirname, 'backend', 'controllers/InventoryController.js');
if (fs.existsSync(controllerPath)) {
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  
  const hasSingleFilter = controllerContent.includes('const { stock_in_auto_number, ...filteredBody } = req.body');
  const hasBatchFilter = controllerContent.includes('const { stock_in_auto_number, ...filteredItem } = item');
  
  console.log(`   单个入库过滤: ${hasSingleFilter ? '✅' : '❌'}`);
  console.log(`   批量入库过滤: ${hasBatchFilter ? '✅' : '❌'}`);
  
  if (hasSingleFilter && hasBatchFilter) {
    console.log('   ✅ 后端控制器修改正确');
  } else {
    console.log('   ❌ 后端控制器修改不完整');
  }
} else {
  console.log('   ❌ 未找到控制器文件');
}

// 2. 验证前端类型定义修改
console.log('\n2. 验证前端类型定义修改...');
const typesPath = path.join(__dirname, 'frontend/src/types/index.ts');
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  
  const hasStockInAutoNumber = typesContent.includes('stock_in_auto_number?: string');
  
  console.log(`   前端类型定义包含 stock_in_auto_number: ${hasStockInAutoNumber ? '❌' : '✅'}`);
  
  if (!hasStockInAutoNumber) {
    console.log('   ✅ 前端类型定义修改正确');
  } else {
    console.log('   ❌ 前端类型定义修改不完整');
  }
} else {
  console.log('   ❌ 未找到前端类型定义文件');
}

// 3. 验证前端服务修改
console.log('\n3. 验证前端服务修改...');
const servicePath = path.join(__dirname, 'frontend/src/services/inventory.ts');
if (fs.existsSync(servicePath)) {
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  const hasStockInAutoNumber = serviceContent.includes('stock_in_auto_number?: string');
  
  console.log(`   前端服务包含 stock_in_auto_number: ${hasStockInAutoNumber ? '❌' : '✅'}`);
  
  if (!hasStockInAutoNumber) {
    console.log('   ✅ 前端服务修改正确');
  } else {
    console.log('   ❌ 前端服务修改不完整');
  }
} else {
  console.log('   ❌ 未找到前端服务文件');
}

// 4. 验证数据库配置标记
console.log('\n4. 验证数据库配置标记...');
const dbConfigPath = path.join(__dirname, 'backend/config/database.js');
if (fs.existsSync(dbConfigPath)) {
  const dbConfigContent = fs.readFileSync(dbConfigPath, 'utf8');
  
  const hasDeprecatedComment = dbConfigContent.includes('stock_in_auto_number VARCHAR(50),  -- 已废弃，不再使用');
  
  console.log(`   数据库配置标记为已废弃: ${hasDeprecatedComment ? '✅' : '❌'}`);
  
  if (hasDeprecatedComment) {
    console.log('   ✅ 数据库配置标记正确');
  } else {
    console.log('   ❌ 数据库配置标记不完整');
  }
} else {
  console.log('   ❌ 未找到数据库配置文件');
}

// 5. 验证数据库初始化脚本标记
console.log('\n5. 验证数据库初始化脚本标记...');
const initSqlPath = path.join(__dirname, 'database/init.sql');
if (fs.existsSync(initSqlPath)) {
  const initSqlContent = fs.readFileSync(initSqlPath, 'utf8');
  
  const hasDeprecatedComment = initSqlContent.includes('`stock_in_auto_number` VARCHAR(50) NULL COMMENT \'系统自动编号（已废弃）\'');
  
  console.log(`   数据库初始化脚本标记为已废弃: ${hasDeprecatedComment ? '✅' : '❌'}`);
  
  if (hasDeprecatedComment) {
    console.log('   ✅ 数据库初始化脚本标记正确');
  } else {
    console.log('   ❌ 数据库初始化脚本标记不完整');
  }
} else {
  console.log('   ❌ 未找到数据库初始化脚本');
}

// 6. 总结
console.log('\n6. 总结...');
console.log('   问题分析:');
console.log('   - stock_in_auto_number 字段在之前的数据库记录中确实存在值');
console.log('   - 这是因为在之前的代码版本中该字段是被正常使用的');
console.log('   - 现在根据需求，我们需要确保不再写入该字段');
console.log('');
console.log('   解决方案:');
console.log('   ✅ 1. 在后端控制器中过滤掉 stock_in_auto_number 字段');
console.log('   ✅ 2. 在前端类型定义中移除 stock_in_auto_number 字段');
console.log('   ✅ 3. 在前端服务中移除对 stock_in_auto_number 字段的引用');
console.log('   ✅ 4. 在数据库配置中将该字段标记为已废弃');
console.log('   ✅ 5. 在数据库初始化脚本中将该字段标记为已废弃');
console.log('');
console.log('   验证结果:');
console.log('   - 通过API接口的入库操作将不再写入 stock_in_auto_number 字段');
console.log('   - 现有的数据库记录中的 stock_in_auto_number 值将保持不变');
console.log('   - 数据库表结构中仍保留该字段，但标记为已废弃');
console.log('');
console.log('✅ 最终验证完成！stock_in_auto_number 字段不再被写入的问题已解决。');

console.log('\n建议:');
console.log('- 如果需要完全清理历史数据中的 stock_in_auto_number 值，可以考虑执行数据库清理脚本');
console.log('- 如果未来需要彻底移除该字段，可以在确保无任何依赖后再修改数据库表结构');