const http = require('http');

// 创建供应商的请求数据
const postData = JSON.stringify({
  company_name: '测试供应商' + Date.now(),
  contact_person: '联系人',
  phone: '12345678901'
});

// 请求选项
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/suppliers',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// 发送请求
const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('响应数据:');
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
  console.error('请求错误:', error);
});

// 写入数据并结束请求
req.write(postData);
req.end();