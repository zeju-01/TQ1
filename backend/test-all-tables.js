const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testAllTables() {
  try {
    // 打开数据库连接
    const db = await open({
      filename: path.join(__dirname, 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 创建测试数据
    await db.run('INSERT INTO suppliers (company_name, contact_person) VALUES (?, ?)', ['测试供应商', '联系人']);
    await db.run('INSERT INTO operators (name) VALUES (?)', ['测试运营商']);
    await db.run('INSERT INTO couriers (name) VALUES (?)', ['测试快递公司']);
    await db.run('INSERT INTO business_staff (staff_name) VALUES (?)', ['测试业务员']);
    
    // 查询最新创建的记录
    const supplier = await db.get('SELECT id, company_name, created_at FROM suppliers ORDER BY id DESC LIMIT 1');
    const operator = await db.get('SELECT id, name, created_at FROM operators ORDER BY id DESC LIMIT 1');
    const courier = await db.get('SELECT id, name, created_at FROM couriers ORDER BY id DESC LIMIT 1');
    const staff = await db.get('SELECT id, staff_name, created_at FROM business_staff ORDER BY id DESC LIMIT 1');
    
    console.log('新创建的记录:');
    console.log('供应商:', supplier);
    console.log('运营商:', operator);
    console.log('快递公司:', courier);
    console.log('业务员:', staff);
    
    // 关闭数据库连接
    await db.close();
  } catch (error) {
    console.error('操作失败:', error);
  }
}

testAllTables();