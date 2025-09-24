const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function queryAdminUserPassword() {
  try {
    // 打开数据库连接
    const db = await open({
      filename: path.join(__dirname, 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 查询管理员账户密码
    const user = await db.get('SELECT username, password FROM users WHERE username = "admin"');
    console.log('管理员账户信息:', user);
    
    // 关闭数据库连接
    await db.close();
  } catch (error) {
    console.error('查询数据库失败:', error);
  }
}

queryAdminUserPassword();