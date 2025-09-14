// 测试认证和用户信息
const { executeQuery } = require('./utils/database');

async function testAuth() {
  try {
    console.log('查询用户信息...');
    const result = await executeQuery('SELECT id, username, role, created_at FROM users ORDER BY id LIMIT 5');
    
    if (result.success) {
      console.log('用户列表:');
      result.data.forEach(user => {
        console.log(`- ID: ${user.id}, 用户名: ${user.username}, 角色: ${user.role}`);
      });
    } else {
      console.log('查询失败:', result.error);
    }

    // 测试登录API
    console.log('\n测试登录API...');
    const loginData = { username: 'superadmin', password: 'admin123' };
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    const loginResult = await response.json();
    console.log('登录结果:', JSON.stringify(loginResult, null, 2));
    
    if (loginResult.success && loginResult.data?.accessToken) {
      // 测试产品删除
      console.log('\n使用token测试产品删除...');
      const deleteResponse = await fetch('http://localhost:3000/api/products/999', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${loginResult.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const deleteResult = await deleteResponse.json();
      console.log('删除测试结果:', JSON.stringify(deleteResult, null, 2));
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testAuth();