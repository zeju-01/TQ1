const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5174/api/auth/login', {
      username: 'superadmin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('登录成功:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('登录失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

testLogin();