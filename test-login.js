const axios = require('axios');

async function testLogin() {
  try {
    console.log('测试登录功能...');
    
    // 测试登录
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'superadmin',
      password: 'admin123'
    });
    
    console.log('登录响应:', loginResponse.data);
    
    if (loginResponse.data.success) {
      console.log('登录成功！');
      console.log('访问令牌:', loginResponse.data.data.accessToken);
      console.log('刷新令牌:', loginResponse.data.data.refreshToken);
      console.log('用户信息:', loginResponse.data.data.user);
    } else {
      console.log('登录失败:', loginResponse.data.message);
    }
  } catch (error) {
    console.error('登录请求失败:', error.response ? error.response.data : error.message);
  }
}

testLogin();