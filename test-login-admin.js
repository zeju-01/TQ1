const axios = require('axios');

async function testLogin() {
  try {
    console.log('开始测试admin用户登录功能...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'superadmin',
      password: 'admin123'
    });
    
    console.log('登录响应:', response.data);
    
    if (response.data.success) {
      console.log('登录成功!');
      console.log('用户信息:', response.data.data.user);
    } else {
      console.log('登录失败:', response.data.message);
    }
  } catch (error) {
    console.error('登录请求失败:', error.response ? error.response.data : error.message);
  }
}

testLogin();