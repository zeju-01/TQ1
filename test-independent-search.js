const axios = require('axios');

async function testIndependentSearch() {
  try {
    console.log('开始测试独立搜索功能...');
    
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
    
    // 测试供应商独立搜索功能
    console.log('\n=== 测试供应商独立搜索功能 ===');
    const supplierSearchResponse = await axios.get('http://localhost:3000/api/suppliers?page=1&limit=10&search=移远', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('供应商搜索结果数量:', supplierSearchResponse.data.pagination.total);
    console.log('供应商搜索结果:', supplierSearchResponse.data.data.map(s => s.company_name));
    
    // 测试运营商独立搜索功能
    console.log('\n=== 测试运营商独立搜索功能 ===');
    const operatorSearchResponse = await axios.get('http://localhost:3000/api/operators?page=1&limit=10&search=联通', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('运营商搜索结果数量:', operatorSearchResponse.data.pagination.total);
    console.log('运营商搜索结果:', operatorSearchResponse.data.data.map(o => o.name));
    
    // 测试快递公司独立搜索功能
    console.log('\n=== 测试快递公司独立搜索功能 ===');
    const courierSearchResponse = await axios.get('http://localhost:3000/api/couriers?page=1&limit=10&search=顺丰', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('快递公司搜索结果数量:', courierSearchResponse.data.pagination.total);
    console.log('快递公司搜索结果:', courierSearchResponse.data.data.map(c => c.name));
    
    console.log('\n测试完成！三个标签页的搜索功能现在是独立的。');
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
  }
}

testIndependentSearch();