const { executeQuery } = require('./backend/config/database');

async function checkDatabase() {
  try {
    console.log('检查数据库中的数据...');
    
    // 检查各表的记录数量
    const tables = ['users', 'products', 'suppliers', 'business_staff', 'operators', 'couriers', 'inventory'];
    
    for (const table of tables) {
      const result = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table} 表记录数: ${result.data[0].count}`);
    }
    
    // 检查保留的管理员账户
    console.log('\n检查保留的管理员账户:');
    const adminUsers = await executeQuery("SELECT username, role FROM users WHERE username IN ('admin', 'superadmin')");
    if (adminUsers.success) {
      adminUsers.data.forEach(user => {
        console.log(`用户名: ${user.username}, 角色: ${user.role}`);
      });
    }
    
    console.log('\n数据库检查完成！');
  } catch (error) {
    console.error('检查数据库失败:', error);
  }
}

// 执行检查操作
checkDatabase();