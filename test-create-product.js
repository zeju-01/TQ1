const http = require('http');

// 先登录获取认证令牌
const loginData = JSON.stringify({
  username: 'admin',
  password: 'password'  // 默认密码是password
});

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const loginResponse = JSON.parse(data);
      if (loginResponse.success && loginResponse.data && loginResponse.data.token) {
        console.log('登录成功，获取到令牌');
        // 使用令牌创建产品
        createProduct(loginResponse.data.token);
      } else {
        console.error('登录失败:', loginResponse.message);
      }
    } catch (error) {
      console.error('解析登录响应失败:', error);
      console.log('原始响应数据:', data);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('登录请求错误:', error);
});

loginReq.write(loginData);
loginReq.end();

// 创建产品的函数
function createProduct(token) {
  const postData = JSON.stringify({
    name: '测试产品' + Date.now(),
    model: 'TEST-' + Date.now(),
    description: '测试产品描述'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('创建产品响应:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.data && response.data.created_at) {
          console.log('创建时间:', response.data.created_at);
          console.log('创建时间类型:', typeof response.data.created_at);
        }
      } catch (error) {
        console.error('解析响应数据失败:', error);
        console.log('原始响应数据:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('创建产品请求错误:', error);
  });

  req.write(postData);
  req.end();
}