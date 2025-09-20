const axios = require('axios');

async function debugSearch() {
  try {
    console.log('开始调试搜索功能...');
    
    // 先登录获取令牌
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'superadmin',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('登录失败:', loginResponse.data.message);
      return;
    }
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('登录成功，获取到访问令牌');
    
    // 测试不带搜索参数的请求
    console.log('\n=== 测试不带搜索参数的请求 ===');
    const noSearchResponse = await axios.get('http://localhost:3000/api/suppliers?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('不带搜索参数的结果数量:', noSearchResponse.data.pagination.total);
    
    // 测试带空搜索参数的请求
    console.log('\n=== 测试带空搜索参数的请求 ===');
    const emptySearchResponse = await axios.get('http://localhost:3000/api/suppliers?page=1&limit=10&search=', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('带空搜索参数的结果数量:', emptySearchResponse.data.pagination.total);
    
    // 测试带搜索参数的请求
    console.log('\n=== 测试带搜索参数的请求 ===');
    const searchResponse = await axios.get('http://localhost:3000/api/suppliers?page=1&limit=10&search=移远', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('带搜索参数的结果数量:', searchResponse.data.pagination.total);
    console.log('搜索结果:', searchResponse.data.data.map(s => s.company_name));
    
    // 测试业务人员搜索
    console.log('\n=== 测试业务人员搜索 ===');
    const staffNoSearchResponse = await axios.get('http://localhost:3000/api/business-staff?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('业务人员不带搜索参数的结果数量:', staffNoSearchResponse.data.pagination.total);
    
    const staffSearchResponse = await axios.get('http://localhost:3000/api/business-staff?page=1&limit=10&search=陈', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('业务人员带搜索参数的结果数量:', staffSearchResponse.data.pagination.total);
    console.log('业务人员搜索结果:', staffSearchResponse.data.data.map(s => s.staff_name));
    
  } catch (error) {
    console.error('调试失败:', error.response ? error.response.data : error.message);
  }
}

debugSearch();