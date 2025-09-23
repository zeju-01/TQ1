const { executeQuery } = require('./config/database');

async function fixImeiConstraint() {
  try {
    // 初始化数据库
    const dbModule = require('./config/database');
    await dbModule.initDatabase();
    
    console.log('开始修复IMEI字段约束...');
    
    // 由于SQLite不支持直接修改列约束，我们需要：
    // 1. 创建新表（没有UNIQUE约束）
    // 2. 复制数据
    // 3. 删除旧表
    // 4. 重命名新表
    
    console.log('创建新表...');
    await executeQuery(`
      CREATE TABLE inventory_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        product_name VARCHAR(100),
        product_model VARCHAR(50),
        product_description TEXT,
        operator VARCHAR(50),
        imei VARCHAR(50),  -- 移除UNIQUE约束
        batch_number VARCHAR(50),
        stock_in_quantity INTEGER,
        stock_in_status VARCHAR(20),
        return_status VARCHAR(20),
        after_sales_status VARCHAR(20),
        other_status VARCHAR(20),
        stock_in_number VARCHAR(50),
        stock_in_auto_number VARCHAR(50),
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
    
    console.log('复制数据...');
    await executeQuery(`
      INSERT INTO inventory_new SELECT * FROM inventory
    `);
    
    console.log('删除旧表...');
    await executeQuery('DROP TABLE inventory');
    
    console.log('重命名新表...');
    await executeQuery('ALTER TABLE inventory_new RENAME TO inventory');
    
    console.log('修复完成！');
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
}

fixImeiConstraint();