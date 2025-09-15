const axios = require('axios');

async function testSearchFix() {
  try {
    console.log('开始测试修复后的搜索功能...');
    
    // 先登录获取令牌
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'superadmin',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('登录失败:', loginResponse.data.message);
      return;
    }
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('登录成功，获取到访问令牌');
    
    // 测试供应商搜索功能
    console.log('\n=== 测试供应商搜索功能 ===');
    const supplierSearchResponse = await axios.get('http://localhost:3001/api/suppliers?page=1&limit=10&search=移远', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('供应商搜索结果数量:', supplierSearchResponse.data.pagination.total);
    console.log('供应商搜索结果:', supplierSearchResponse.data.data.map(s => s.company_name));
    
    // 测试业务人员搜索功能
    console.log('\n=== 测试业务人员搜索功能 ===');
    const staffSearchResponse = await axios.get('http://localhost:3001/api/business-staff?page=1&limit=10&search=陈', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('业务人员搜索结果数量:', staffSearchResponse.data.pagination.total);
    console.log('业务人员搜索结果:', staffSearchResponse.data.data.map(s => s.staff_name));
    
    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
  }
}

testSearchFix();