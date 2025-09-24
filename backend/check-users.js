const { executeQuery } = require('./config/database');

async function checkUsers() {
  try {
    // 查询所有用户
    const query = 'SELECT id, username, role, full_name, permission FROM users';
    const result = await executeQuery(query);
    
    console.log('数据库中的用户列表:');
    console.log('====================');
    
    if (result.success && result.data.length > 0) {
      result.data.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`用户名: ${user.username}`);
        console.log(`角色: ${user.role}`);
        console.log(`全名: ${user.full_name}`);
        console.log(`权限: ${user.permission}`);
        console.log('---------------------');
      });
    } else {
      console.log('数据库中没有用户数据');
    }
  } catch (error) {
    console.error('查询用户数据时出错:', error);
  }
}

checkUsers();