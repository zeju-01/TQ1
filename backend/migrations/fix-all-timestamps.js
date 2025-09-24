// 修复所有表时间字段的数据库迁移脚本
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrateAllTables() {
  let db;
  try {
    // 打开数据库连接
    db = await open({
      filename: path.join(__dirname, '..', 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 开始事务
    await db.exec('BEGIN TRANSACTION');
    
    console.log('开始修复所有表的时间字段...');
    
    // 定义需要修复的表
    const tables = [
      {
        name: 'suppliers',
        fields: ['id', 'company_name', 'contact_person', 'phone', 'email', 'address', 'contact_info', 'other_info', 'status', 'created_at', 'updated_at']
      },
      {
        name: 'operators',
        fields: ['id', 'name', 'code', 'description', 'contact_person', 'phone', 'email', 'address', 'status', 'created_at', 'updated_at']
      },
      {
        name: 'couriers',
        fields: ['id', 'name', 'code', 'description', 'contact_person', 'phone', 'email', 'address', 'tracking_url', 'status', 'created_at', 'updated_at']
      },
      {
        name: 'business_staff',
        fields: ['id', 'staff_name', 'nickname', 'position', 'department', 'phone', 'email', 'contact_info', 'status', 'created_at', 'updated_at']
      }
    ];
    
    // 逐个处理每个表
    for (const table of tables) {
      console.log(`\n处理表: ${table.name}`);
      
      // 1. 创建新的表，使用正确的北京时间格式
      let createTableSQL = `CREATE TABLE ${table.name}_new (\n`;
      
      // 根据表名添加字段定义
      if (table.name === 'suppliers') {
        createTableSQL += `  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  contact_info VARCHAR(200),
  other_info TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
  updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))`;
      } else if (table.name === 'operators') {
        createTableSQL += `  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
  updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))`;
      } else if (table.name === 'couriers') {
        createTableSQL += `  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  tracking_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
  updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))`;
      } else if (table.name === 'business_staff') {
        createTableSQL += `  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_name VARCHAR(50) NOT NULL,
  nickname VARCHAR(50),
  position VARCHAR(50),
  department VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  contact_info VARCHAR(200),
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
  updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))`;
      }
      
      createTableSQL += '\n)';
      
      await db.exec(createTableSQL);
      console.log(`  创建新的${table.name}表完成`);
      
      // 2. 复制现有数据到新表
      const fieldsList = table.fields.join(', ');
      await db.exec(`
        INSERT INTO ${table.name}_new (${fieldsList})
        SELECT ${fieldsList} FROM ${table.name}
      `);
      
      console.log(`  数据迁移完成`);
      
      // 3. 删除旧表
      await db.exec(`DROP TABLE ${table.name}`);
      console.log(`  删除旧表完成`);
      
      // 4. 重命名新表
      await db.exec(`ALTER TABLE ${table.name}_new RENAME TO ${table.name}`);
      console.log(`  重命名新表完成`);
    }
    
    // 提交事务
    await db.exec('COMMIT');
    
    console.log('\n所有表的时间字段修复完成！');
    
    // 验证修复结果
    console.log('\n=== 修复后的表结构 ===');
    for (const table of tables) {
      const result = await db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${table.name}'`);
      console.log(`\n${table.name} 表结构:`);
      console.log(result.sql);
    }
    
  } catch (error) {
    // 回滚事务
    if (db) {
      await db.exec('ROLLBACK');
    }
    console.error('迁移过程中发生错误:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    if (db) {
      await db.close();
    }
  }
}

// 执行迁移
migrateAllTables().catch(error => {
  console.error('迁移失败:', error);
  process.exit(1);
});