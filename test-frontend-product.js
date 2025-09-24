const axios = require('axios');

async function testFrontendProductAPI() {
  try {
    console.log('测试前端产品API请求...');
    
    // 测试获取产品列表
    console.log('1. 测试获取产品列表:');
    const listResponse = await axios.get('http://localhost:5000/api/products');
    console.log('产品列表响应:', listResponse.data.success, listResponse.data.data.length);
    
    // 测试获取产品选项
    console.log('2. 测试获取产品选项:');
    const optionsResponse = await axios.get('http://localhost:5000/api/products/options');
    console.log('产品选项响应:', optionsResponse.data.success, optionsResponse.data.data.length);
    
    console.log('所有测试完成!');
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
  }
}

testFrontendProductAPI();