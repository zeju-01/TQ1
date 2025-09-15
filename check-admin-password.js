const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function checkAdminPassword() {
  let db;
  try {
    // 打开数据库连接
    db = await open({
      filename: path.join(__dirname, 'backend', 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 获取admin用户信息
    const user = await db.get('SELECT id, username, password FROM users WHERE username = ?', ['admin']);
    console.log('admin用户信息:', user);
    
    if (user) {
      // 测试密码验证
      const testPasswords = ['admin', 'admin123', 'password'];
      console.log('\n密码验证测试:');
      
      for (const password of testPasswords) {
        try {
          const isValid = await bcrypt.compare(password, user.password);
          console.log(`密码 "${password}": ${isValid ? '✓ 正确' : '✗ 错误'}`);
        } catch (error) {
          console.log(`验证密码 "${password}" 时出错:`, error.message);
        }
      }
    } else {
      console.log('未找到admin用户');
    }
    
  } catch (error) {
    console.error('检查密码过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    if (db) {
      await db.close();
    }
  }
}

checkAdminPassword();