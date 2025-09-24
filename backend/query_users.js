const db = require('./config/database');

async function queryUsers() {
  try {
    await db.initDatabase();
    const result = await db.executeQuery('SELECT * FROM users');
    console.log('用户列表:', result);
  } catch (error) {
    console.error('查询用户失败:', error);
  }
}

queryUsers();