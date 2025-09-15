const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkPasswords() {
  let db;
  try {
    // 打开数据库连接
    db = await open({
      filename: path.join(__dirname, 'backend', 'data', 'inventory.db'),
      driver: sqlite3.Database
    });
    
    // 查询所有用户数据
    const users = await db.all('SELECT id, username, password FROM users');
    console.log('用户密码数据:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, 用户名: ${user.username}, 密码: ${user.password}`);
    });
    
  } catch (error) {
    console.error('查询过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    if (db) {
      await db.close();
    }
  }
}

checkPasswords();