const axios = require('axios');

async function testAuth() {
  try {
    console.log('测试认证接口...');
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'superadmin',
      password: 'admin123'
    });
    
    console.log('认证响应:', response.data);
  } catch (error) {
    console.error('认证测试出错:');
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

testAuth();