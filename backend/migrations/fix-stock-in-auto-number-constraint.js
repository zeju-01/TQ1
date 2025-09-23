// 修复 stock_in_auto_number 字段的约束问题
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function fixStockInAutoNumberConstraint() {
  try {
    console.log('修复 stock_in_auto_number 字段的约束问题...\n');
    
    // 连接数据库
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'inventory.db');
    console.log('数据库路径:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 1. 检查当前字段约束
    console.log('1. 检查当前字段约束...');
    const tableInfo = await db.all("PRAGMA table_info(inventory)");
    const autoNumberField = tableInfo.find(field => field.name === 'stock_in_auto_number');
    console.log(`   当前 stock_in_auto_number 字段约束: ${autoNumberField.notnull ? 'NOT NULL' : 'NULL'} ${autoNumberField.dflt_value ? `默认值: ${autoNumberField.dflt_value}` : ''}`);
    
    // 2. 由于 SQLite 不支持直接修改列约束，我们需要：
    //    a. 创建一个新表（没有 NOT NULL 约束）
    //    b. 复制数据
    //    c. 删除旧表
    //    d. 重命名新表
    
    console.log('\n2. 开始修复过程...');
    
    // 开始事务
    await db.exec('BEGIN TRANSACTION');
    
    try {
      // 创建新表（移除 stock_in_auto_number 的 NOT NULL 约束）
      console.log('   创建新表...');
      await db.exec(`
        CREATE TABLE inventory_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER,
          product_name VARCHAR(100),
          product_model VARCHAR(50),
          product_description TEXT,
          operator VARCHAR(50),
          imei VARCHAR(50) UNIQUE,
          batch_number VARCHAR(50),
          stock_in_quantity INTEGER,
          stock_in_status VARCHAR(20),
          return_status VARCHAR(20),
          after_sales_status VARCHAR(20),
          other_status VARCHAR(20),
          stock_in_number VARCHAR(50),
          stock_in_auto_number VARCHAR(50),  -- 移除 NOT NULL 约束
          supplier VARCHAR(100),
          factory_name VARCHAR(100),
          factory_order VARCHAR(50),
          stock_in_date DATETIME,
          stock_in_contract_number VARCHAR(50),
          stock_in_document VARCHAR(100),
          stock_in_document_path VARCHAR(255),
          stock_in_time DATETIME,
          stock_in_by VARCHAR(50),
          return_time DATETIME,
          returned_by INTEGER,
          return_reason VARCHAR(100),
          return_type VARCHAR(20),
          return_notes TEXT,
          after_sales_time DATETIME,
          after_sales_by INTEGER,
          stock_in_notes TEXT,
          stock_out_number VARCHAR(50),
          stock_out_document VARCHAR(100),
          stock_out_document_path VARCHAR(255),
          stock_out_date DATETIME,
          stock_out_quantity INTEGER,
          stock_out_contract_number VARCHAR(50),
          sales_order_number VARCHAR(50),
          recipient VARCHAR(100),
          delivery_info TEXT,
          courier_company VARCHAR(50),
          tracking_number VARCHAR(50),
          stock_out_time DATETIME,
          stock_out_by INTEGER,
          stock_out_notes TEXT,
          stock_out_status VARCHAR(20),
          quantity INTEGER,
          transaction_type VARCHAR(10) NOT NULL,
          customer VARCHAR(100),
          created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
          updated_at DATETIME
        )
      `);
      
      // 复制数据
      console.log('   复制数据...');
      await db.exec(`
        INSERT INTO inventory_new SELECT * FROM inventory
      `);
      
      // 删除旧表
      console.log('   删除旧表...');
      await db.exec('DROP TABLE inventory');
      
      // 重命名新表
      console.log('   重命名新表...');
      await db.exec('ALTER TABLE inventory_new RENAME TO inventory');
      
      // 重新创建索引
      console.log('   重新创建索引...');
      await db.exec('CREATE INDEX idx_inventory_imei ON inventory(imei)');
      await db.exec('CREATE INDEX idx_inventory_product_id ON inventory(product_id)');
      await db.exec('CREATE INDEX idx_inventory_stock_in_number ON inventory(stock_in_number)');
      await db.exec('CREATE INDEX idx_inventory_stock_out_number ON inventory(stock_out_number)');
      await db.exec('CREATE INDEX idx_inventory_stock_in_date ON inventory(stock_in_date)');
      await db.exec('CREATE INDEX idx_inventory_stock_out_date ON inventory(stock_out_date)');
      await db.exec('CREATE INDEX idx_inventory_transaction_type ON inventory(transaction_type)');
      await db.exec('CREATE INDEX idx_inventory_stock_in_status ON inventory(stock_in_status)');
      await db.exec('CREATE INDEX idx_inventory_stock_out_status ON inventory(stock_out_status)');
      
      // 提交事务
      await db.exec('COMMIT');
      console.log('   ✅ 数据库表结构修复完成');
      
    } catch (error) {
      // 回滚事务
      await db.exec('ROLLBACK');
      throw error;
    }
    
    // 3. 验证修复结果
    console.log('\n3. 验证修复结果...');
    const newTableInfo = await db.all("PRAGMA table_info(inventory)");
    const newAutoNumberField = newTableInfo.find(field => field.name === 'stock_in_auto_number');
    console.log(`   修复后 stock_in_auto_number 字段约束: ${newAutoNumberField.notnull ? 'NOT NULL' : 'NULL'} ${newAutoNumberField.dflt_value ? `默认值: ${newAutoNumberField.dflt_value}` : ''}`);
    
    if (!newAutoNumberField.notnull) {
      console.log('   ✅ 字段约束已成功修复');
    } else {
      console.log('   ❌ 字段约束修复失败');
    }
    
    await db.close();
    console.log('\n✅ stock_in_auto_number 字段约束修复完成！');
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
}

// 执行修复
fixStockInAutoNumberConstraint();