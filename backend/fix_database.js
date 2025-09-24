const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'data', 'inventory.db');

async function fixDatabase() {
  let db;
  try {
    // 连接数据库
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    console.log('开始修复数据库...');

    // 1. 创建新的库存表，使用正确的时区设置
    console.log('创建新的库存表...');
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
        supplier VARCHAR(100),
        factory_name VARCHAR(100),
        factory_order VARCHAR(50),
        stock_in_date DATETIME DEFAULT (datetime('now', '+8 hours')),
        stock_in_contract_number VARCHAR(50),
        stock_in_document VARCHAR(100),
        stock_in_document_path VARCHAR(255),
        stock_in_time DATETIME DEFAULT (datetime('now', '+8 hours')),
        stock_in_by VARCHAR(50),
        return_time DATETIME DEFAULT (datetime('now', '+8 hours')),
        returned_by INTEGER,
        return_reason VARCHAR(100),
        return_type VARCHAR(20),
        return_notes TEXT,
        after_sales_time DATETIME DEFAULT (datetime('now', '+8 hours')),
        after_sales_by INTEGER,
        stock_in_notes TEXT,
        stock_out_number VARCHAR(50),
        stock_out_document VARCHAR(100),
        stock_out_document_path VARCHAR(255),
        stock_out_date DATETIME DEFAULT (datetime('now', '+8 hours')),
        stock_out_quantity INTEGER,
        stock_out_contract_number VARCHAR(50),
        sales_order_number VARCHAR(50),
        recipient VARCHAR(100),
        delivery_info TEXT,
        courier_company VARCHAR(50),
        tracking_number VARCHAR(50),
        stock_out_time DATETIME DEFAULT (datetime('now', '+8 hours')),
        stock_out_by INTEGER,
        stock_out_notes TEXT,
        stock_out_status VARCHAR(20),
        quantity INTEGER,
        transaction_type VARCHAR(10) NOT NULL,
        customer VARCHAR(100),
        created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
        updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))
      )
    `);

    // 2. 复制现有数据到新表（保持原有时间值）
    console.log('复制现有数据到新表...');
    await db.exec(`
      INSERT INTO inventory_new (
        id, product_id, product_name, product_model, product_description, operator,
        imei, batch_number, stock_in_quantity, stock_in_status, return_status,
        after_sales_status, other_status, stock_in_number, supplier,
        factory_name, factory_order, stock_in_date, stock_in_contract_number,
        stock_in_document, stock_in_document_path, stock_in_time, stock_in_by, return_time,
        returned_by, return_reason, return_type, return_notes, after_sales_time,
        after_sales_by, stock_in_notes, stock_out_number, stock_out_document,
        stock_out_document_path, stock_out_date, stock_out_quantity, stock_out_contract_number,
        sales_order_number, recipient, delivery_info, courier_company, tracking_number,
        stock_out_time, stock_out_by, stock_out_notes, stock_out_status, quantity,
        transaction_type, customer, created_at, updated_at
      )
      SELECT 
        id, product_id, product_name, product_model, product_description, operator,
        imei, batch_number, stock_in_quantity, stock_in_status, return_status,
        after_sales_status, other_status, stock_in_number, supplier,
        factory_name, factory_order, stock_in_date, stock_in_contract_number,
        stock_in_document, stock_in_document_path, stock_in_time, stock_in_by, return_time,
        returned_by, return_reason, return_type, return_notes, after_sales_time,
        after_sales_by, stock_in_notes, stock_out_number, stock_out_document,
        stock_out_document_path, stock_out_date, stock_out_quantity, stock_out_contract_number,
        sales_order_number, recipient, delivery_info, courier_company, tracking_number,
        stock_out_time, stock_out_by, stock_out_notes, stock_out_status, quantity,
        transaction_type, customer, created_at, updated_at
      FROM inventory
    `);

    // 3. 删除旧表
    console.log('删除旧表...');
    await db.exec('DROP TABLE inventory');

    // 4. 重命名新表
    console.log('重命名新表...');
    await db.exec('ALTER TABLE inventory_new RENAME TO inventory');

    console.log('数据库修复完成！');

    // 验证修复结果
    console.log('验证修复结果...');
    const tableInfo = await db.all("PRAGMA table_info(inventory)");
    const timeColumns = tableInfo.filter(col => 
      col.name.includes('_time') || col.name.includes('_date') || col.name === 'created_at' || col.name === 'updated_at'
    );

    console.log('修复后的时间相关字段:');
    timeColumns.forEach(col => {
      console.log(`- ${col.name}: ${col.dflt_value || 'NULL'}`);
    });

  } catch (error) {
    console.error('修复数据库时出错:', error);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

fixDatabase();