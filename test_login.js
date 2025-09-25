const axios = require('axios');

async function testLogin() {
  try {
    console.log('测试登录功能...');
    
    // 设置基础URL为新的后端端口
    const BASE_URL = 'http://localhost:5002/api';
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'superadmin',
      password: 'admin123'
    });
    
    console.log('✅ 登录成功！');
    console.log('响应数据:', response.data);
    
    // 检查响应结构
    if (response.data.success && response.data.data && response.data.data.accessToken) {
      console.log('✅ 访问令牌获取成功');
      console.log('令牌前缀:', response.data.data.accessToken.substring(0, 20) + '...');
    } else {
      console.log('❌ 响应结构不符合预期');
    }
    
  } catch (error) {
    console.error('🚨 登录失败:');
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求信息:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

testLogin();