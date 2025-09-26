// 添加 updated_by 字段到 inventory 表的迁移脚本
const { executeQuery } = require('../config/database');

async function up() {
  try {
    // SQLite 不支持直接添加字段到特定位置，也不支持 COMMENT
    const addColumnQuery = `
      ALTER TABLE inventory 
      ADD COLUMN updated_by VARCHAR(50) NULL
    `;
    
    await executeQuery(addColumnQuery);
    console.log('成功添加 updated_by 字段到 inventory 表');
  } catch (error) {
    // 如果字段已存在，会抛出错误，我们捕获并忽略
    if (error.message && error.message.includes('duplicate column name')) {
      console.log('updated_by 字段已存在，跳过添加');
      return;
    }
    console.error('添加 updated_by 字段失败:', error);
    throw error;
  }
}

async function down() {
  try {
    // 删除 updated_by 字段
    const dropColumnQuery = `
      ALTER TABLE inventory 
      DROP COLUMN updated_by
    `;
    
    await executeQuery(dropColumnQuery);
    console.log('成功删除 inventory 表中的 updated_by 字段');
  } catch (error) {
    console.error('删除 updated_by 字段失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本，则执行 up 函数
if (require.main === module) {
  up().then(() => {
    console.log('迁移执行完成');
    process.exit(0);
  }).catch((error) => {
    console.error('迁移执行失败:', error);
    process.exit(1);
  });
}

module.exports = { up, down };