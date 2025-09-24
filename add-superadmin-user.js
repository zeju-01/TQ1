const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function addSuperAdminUser() {
  let db;
  try {
    // 打开数据库连接
    db = await open({
      filename: path.join(__dirname, 'backend', 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 加密密码
    const saltRounds = 10;
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 插入默认superadmin用户
    const result = await db.run(`
      INSERT OR IGNORE INTO users (username, password, role, full_name, permission) 
      VALUES (?, ?, ?, ?, ?)
    `, ['superadmin', hashedPassword, 'admin', '超级管理员', 'admin']);
    
    if (result.changes > 0) {
      console.log('成功创建默认superadmin用户');
      console.log('用户名: superadmin');
      console.log('密码: admin123');
    } else {
      console.log('superadmin用户已存在');
    }
    
    // 验证用户创建
    const user = await db.get('SELECT id, username, role, full_name, permission FROM users WHERE username = ?', ['superadmin']);
    console.log('用户信息:', user);
    
  } catch (error) {
    console.error('创建superadmin用户过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    if (db) {
      await db.close();
    }
  }
}

addSuperAdminUser();