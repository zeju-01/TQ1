const axios = require('axios');

async function testGetUsers() {
  try {
    console.log('开始测试获取用户列表...');
    
    // 先登录获取令牌
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('登录失败:', loginResponse.data.message);
      return;
    }
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('登录成功，获取到访问令牌');
    
    // 使用令牌获取用户列表
    const usersResponse = await axios.get('http://localhost:3001/api/users?page=2&limit=10', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('用户列表响应:', JSON.stringify(usersResponse.data, null, 2));
    
  } catch (error) {
    console.error('请求失败:', error.response ? error.response.data : error.message);
  }
}

testGetUsers();