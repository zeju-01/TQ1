const axios = require('axios');

// 测试搜索空值的功能
async function testSearchEmpty() {
  try {
    console.log('测试搜索空值的功能');
    
    // 先登录获取访问令牌
    console.log('\n0. 用户登录:');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      username: 'superadmin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('登录成功，获取到访问令牌');
    
    // 设置默认的认证头
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 测试合同编号为空的情况
    console.log('\n1. 测试合同编号为空的情况:');
    const response1 = await axios.get('http://localhost:5001/api/inventory/search-stock-in-numbers', {
      params: {
        filterType: 'contract_number',
        searchValue: ''
      }
    });
    console.log('响应:', response1.data);
    
    // 测试供应商为空的情况
    console.log('\n2. 测试供应商为空的情况:');
    const response2 = await axios.get('http://localhost:5001/api/inventory/search-stock-in-numbers', {
      params: {
        filterType: 'supplier',
        searchValue: ''
      }
    });
    console.log('响应:', response2.data);
    
    // 测试工厂工单为空的情况
    console.log('\n3. 测试工厂工单为空的情况:');
    const response3 = await axios.get('http://localhost:5001/api/inventory/search-stock-in-numbers', {
      params: {
        filterType: 'factory_order',
        searchValue: ''
      }
    });
    console.log('响应:', response3.data);
    
    // 测试箱号为空的情况
    console.log('\n4. 测试箱号为空的情况:');
    const response4 = await axios.get('http://localhost:5001/api/inventory/search-stock-in-numbers', {
      params: {
        filterType: 'box_number',
        searchValue: ''
      }
    });
    console.log('响应:', response4.data);
    
    // 测试合同编号不为空的情况
    console.log('\n5. 测试合同编号不为空的情况:');
    const response5 = await axios.get('http://localhost:5001/api/inventory/search-stock-in-numbers', {
      params: {
        filterType: 'contract_number',
        searchValue: '合同编号1'
      }
    });
    console.log('响应:', response5.data);
    
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
  }
}

testSearchEmpty();