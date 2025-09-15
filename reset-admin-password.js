const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function resetAdminPassword() {
  let db;
  try {
    // 打开数据库连接
    db = await open({
      filename: path.join(__dirname, 'backend', 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 加密新密码
    const saltRounds = 10;
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // 更新admin用户的密码
    await db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'admin']);
    
    console.log('admin用户密码已重置为: admin123');
    
    // 验证更新
    const user = await db.get('SELECT id, username, password FROM users WHERE username = ?', ['admin']);
    console.log('更新后的用户信息:', user);
    
  } catch (error) {
    console.error('重置密码过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    if (db) {
      await db.close();
    }
  }
}

resetAdminPassword();