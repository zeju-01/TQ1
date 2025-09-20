const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// 配置
const BASE_URL = 'http://localhost:5001';
const USERNAME = 'superadmin';
const PASSWORD = 'admin123';
const FILE_PATH = path.join(__dirname, '测试Excel导入文件.csv');

async function testUpload() {
  try {
    console.log('开始测试上传流程...');
    
    // 1. 登录获取认证令牌
    console.log('正在登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: USERNAME,
      password: PASSWORD
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败');
    }
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('登录成功，获取到访问令牌');
    
    // 2. 上传CSV文件
    console.log('正在上传CSV文件...');
    const formData = new FormData();
    formData.append('excel', fs.createReadStream(FILE_PATH));
    
    const uploadResponse = await axios.post(`${BASE_URL}/api/upload/excel`, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('上传响应:', uploadResponse.data);
    
    if (uploadResponse.data.success) {
      console.log('文件上传成功！');
      console.log('上传的数据:', uploadResponse.data.data);
    } else {
      console.log('文件上传失败:', uploadResponse.data.message);
    }
  } catch (error) {
    console.error('测试过程中出现错误:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
  }
}

// 运行测试
testUpload();