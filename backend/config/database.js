// 数据库配置文件 - 使用持久化SQLite数据库
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

// 数据库文件路径
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'inventory.db');

// 确保数据目录存在
const fs = require('fs');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('创建数据目录:', dbDir);
}

// 使用持久化SQLite数据库
let db = null;

// 初始化数据库连接
const initDatabase = async () => {
  try {
    db = await open({
      filename: DB_PATH, // 使用持久化数据库文件
      driver: sqlite3.Database
    });
    
    // 启用外键约束
    await db.exec('PRAGMA foreign_keys = ON');
    
    // 设置时区为北京时间
    await db.exec("PRAGMA time_zone = '+08:00'");
    
    // 创建所需的表结构
    await createTables();
    console.log(`SQLite持久化数据库初始化成功，数据文件: ${DB_PATH}`);
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
};

// 创建表结构
const createTables = async () => {
  // 用户表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      full_name VARCHAR(100),
      abbreviation VARCHAR(20),
      permission VARCHAR(20) DEFAULT 'view',
      remarks TEXT,
      created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
      updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))
    )
  `);

  // 产品表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100),
      model VARCHAR(50),
      description TEXT,
      abbreviation VARCHAR(20),
      created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
      updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))
    )
  `);

  // 供应商表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name VARCHAR(100) NOT NULL,
      contact_person VARCHAR(100),
      phone VARCHAR(20),
      email VARCHAR(100),
      address VARCHAR(255),
      contact_info VARCHAR(200),
      other_info TEXT,
      status VARCHAR(20) DEFAULT 'active',
      created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
      updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))
    )
  `);

  // 业务人员表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS business_staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_name VARCHAR(50) NOT NULL,
      nickname VARCHAR(50),
      position VARCHAR(50),
      department VARCHAR(50),
      phone VARCHAR(20),
      email VARCHAR(100),
      contact_info VARCHAR(200),
      status VARCHAR(20) DEFAULT 'active',
      created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
      updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))
    )
  `);

  // 运营商表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS operators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50),
      description TEXT,
      contact_person VARCHAR(100),
      phone VARCHAR(20),
      email VARCHAR(100),
      address VARCHAR(255),
      status VARCHAR(20) DEFAULT 'active',
      created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
      updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))
    )
  `);

  // 快递公司表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS couriers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      updated_at DATETIME DEFAULT (datetime('now', '+8 hours'))
    )
  `);

  // 插入一些测试数据（仅在数据库为空时插入）
  /*const supplierCount = await db.get('SELECT COUNT(*) as count FROM suppliers');
  if (supplierCount.count === 0) {
    await db.run(`INSERT INTO suppliers (company_name, contact_person, phone, email, address, contact_info, other_info) VALUES 
      ('深圳移远通信技术股份有限公司', '张经理', '0755-86380030', 'sales@quectel.com', '深圳市南山区科技园', '电话: 0755-86380030', '全球领先的物联网模组供应商'),
      ('广和通无线股份有限公司', '李总监', '0755-83756666', 'info@fibocom.com', '深圳市南山区高新区', '电话: 0755-83756666', '专业的无线通信模组供应商'),
      ('美格智能技术股份有限公司', '王部长', '0755-83230326', 'sales@meiglink.com', '深圳市龙岗区平湖街道', '电话: 0755-83230326', '专注于物联网模组的研发和生产')`);
    console.log('已插入供应商测试数据');
  }
  
  const staffCount = await db.get('SELECT COUNT(*) as count FROM business_staff');
  if (staffCount.count === 0) {
    await db.run(`INSERT INTO business_staff (staff_name, nickname, position, department, phone, email, contact_info) VALUES 
      ('陈晓明', '小明', '销售经理', '销售部', '13800138001', 'chenxm@company.com', '手机: 13800138001'),
      ('刘佳丽', '佳佳', '客户经理', '客服部', '13800138002', 'liujl@company.com', '手机: 13800138002'),
      ('张伟强', '阿强', '区域经理', '销售部', '13800138003', 'zhangwq@company.com', '手机: 13800138003'),
      ('王丽华', '华华', '业务专员', '市场部', '13800138004', 'wanglh@company.com', '手机: 13800138004')`);
    console.log('已插入业务人员测试数据');
  }

  // 插入产品测试数据
  await db.run(`
    INSERT OR IGNORE INTO products (name, model, description, abbreviation) VALUES 
    ('4G LTE Cat.1模组', 'EC200U-CN', '高性能4G LTE Cat.1通信模组，支持中国移动/联通/电信网络', 'EC200U'),
    ('4G LTE Cat.4模组', 'EC600U-CN', '高速4G LTE Cat.4通信模组，下载速度150Mbps', 'EC600U'),
    ('NB-IoT模组', 'BC26', '低功耗广域网NB-IoT通信模组', 'BC26'),
    ('2G GSM模组', 'M26', '成熟稳定的2G GSM通信模组', 'M26'),
    ('5G Sub-6GHz模组', 'RG500Q-EA', '5G Sub-6GHz高速通信模组', 'RG500Q')
  `);

  // 插入运营商测试数据
  await db.run(`
    INSERT OR IGNORE INTO operators (name, code, description, contact_person, phone, email, address) VALUES 
    ('中国移动', 'CMCC', '中国移动通信集团有限公司', '张经理', '10086', 'service@10086.cn', '北京市西城区金融大街29号'),
    ('中国联通', 'CUCC', '中国联合网络通信集团有限公司', '李总监', '10010', 'service@10010.com', '北京市西城区大木仓胡同13号'),
    ('中国电信', 'CTCC', '中国电信集团有限公司', '王部长', '10000', 'service@189.cn', '北京市西城区金融街31号')
  `);

  // 插入快递公司测试数据
  await db.run(`
    INSERT OR IGNORE INTO couriers (name, code, description, contact_person, phone, email, address, tracking_url) VALUES 
    ('顺丰速运', 'SF', '中国领先的快递物流综合服务商', '王总', '95338', 'service@sf-express.com', '深圳市福田区莲花街道福中三路1号', 'https://www.sf-express.com/cn/sc/dynamic_function/waybill/#search/bill-number/'),
    ('中通快递', 'ZTO', '中通快递股份有限公司', '李经理', '95311', 'service@zto.com', '上海市青浦区华徐公路1726号', 'https://www.zto.com/'),
    ('圆通快递', 'YTO', '圆通速递有限公司', '张主管', '95311', 'service@yto.net.cn', '上海市青浦区华德路1008号', 'https://www.yto.net.cn/'),
    ('申通快递', 'STO', '申通快递股份有限公司', '陈经理', '95543', 'service@sto.cn', '上海市奉贤区银春路1688号', 'https://www.sto.cn/'),
    ('韵达快递', 'YUNDA', '韵达股份有限公司', '刘主任', '95546', 'service@yunda.co', '上海市青浦区华徐公路1568号', 'https://www.yunda.co/')
  `);
*/
  // 库存表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
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
      stock_in_auto_number VARCHAR(50),  -- 已废弃，不再使用
      supplier VARCHAR(100),
      factory_name VARCHAR(100),
      factory_order VARCHAR(50),
      stock_in_date DATE,  -- 修改为 DATE 类型，只存储年月日
      stock_in_contract_number VARCHAR(50),
      stock_in_document VARCHAR(100),
      stock_in_document_path VARCHAR(255),
      stock_in_time DATETIME,
      stock_in_by VARCHAR(50),
      return_time DATETIME,    -- 移除了默认值
      returned_by INTEGER,
      return_reason VARCHAR(100),
      return_type VARCHAR(20),
      return_notes TEXT,
      after_sales_time DATETIME,  -- 移除了默认值
      after_sales_by INTEGER,
      stock_in_notes TEXT,
      stock_out_number VARCHAR(50),
      stock_out_document VARCHAR(100),
      stock_out_document_path VARCHAR(255),
      stock_out_date DATE,  -- 修改为 DATE 类型，只存储年月日
      stock_out_quantity INTEGER,
      stock_out_contract_number VARCHAR(50),
      sales_order_number VARCHAR(50),
      recipient VARCHAR(100),
      delivery_info TEXT,
      courier_company VARCHAR(50),
      tracking_number VARCHAR(50),
      stock_out_time DATETIME,  -- 移除了默认值
      stock_out_by INTEGER,
      stock_out_notes TEXT,
      stock_out_status VARCHAR(20),
      quantity INTEGER,
      transaction_type VARCHAR(10) NOT NULL,
      customer VARCHAR(100),
      created_at DATETIME DEFAULT (datetime('now', '+8 hours')),  -- 保留created_at的默认值
      updated_at DATETIME  -- 移除了默认值
    )
  `);

  // 插入默认管理员用户
  await db.run(`
    INSERT OR IGNORE INTO users (username, password, role, full_name, permission) 
    VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '系统管理员', 'admin')
  `);
  
  // 插入默认superadmin用户
  await db.run(`
    INSERT OR IGNORE INTO users (username, password, role, full_name, permission) 
    VALUES ('superadmin', '$2b$10$mByZQ7y3HdGnuXTcmNt/zuQjJOa5T4gOVF9iaelPA1Tpb1bW47Lq2', 'admin', '超级管理员', 'admin')
  `);

  // 更新已存在的admin用户角色（为了兼容之前的数据）
  await db.run(`
    UPDATE users SET role = 'admin', permission = 'admin' WHERE username = 'admin'
  `);
  
  // 更新已存在的superadmin用户角色（为了兼容之前的数据）
  await db.run(`
    UPDATE users SET role = 'admin', permission = 'admin' WHERE username = 'superadmin'
  `);
};

// 数据库连接测试
const testConnection = async () => {
  try {
    if (!db) {
      await initDatabase();
    }
    // 简单测试查询
    await db.get('SELECT 1');
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    return false;
  }
};

// 执行查询的辅助函数
const executeQuery = async (query, params = []) => {
  try {
    if (!db) {
      await initDatabase();
    }
    
    // 判断是SELECT还是其他类型的查询
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      const rows = await db.all(query, params);
      return { success: true, data: rows };
    } else {
      const result = await db.run(query, params);
      return { success: true, data: result };
    }
  } catch (error) {
    console.error('查询执行失败:', error);
    return { success: false, error: error.message };
  }
};

// 执行事务的辅助函数
const executeTransaction = async (queries) => {
  if (!db) {
    await initDatabase();
  }
  
  try {
    await db.exec('BEGIN TRANSACTION');
    
    const results = [];
    for (const query of queries) {
      const result = await db.run(query.sql, query.params || []);
      results.push(result);
    }
    
    await db.exec('COMMIT');
    
    return { success: true, data: results };
  } catch (error) {
    await db.exec('ROLLBACK');
    console.error('事务执行失败:', error);
    return { success: false, error: error.message };
  }
};

// 获取下一个序列值的函数
const getNextSequence = async (sequenceName) => {
  try {
    const result = await db.get('SELECT COALESCE(MAX(id), 0) + 1 as next_val FROM inventory');
    return result.next_val;
  } catch (error) {
    console.error('获取序列值失败:', error);
    throw error;
  }
};

module.exports = {
  db,
  testConnection,
  executeQuery,
  executeTransaction,
  getNextSequence,
  initDatabase
};