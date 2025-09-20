const axios = require('axios');

async function testSearchFunctionality() {
  try {
    console.log('开始测试搜索功能...');
    
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
    
    // 测试供应商搜索
    console.log('\n=== 测试供应商搜索 ===');
    const supplierResponse = await axios.get('http://localhost:3000/api/suppliers?page=1&limit=10&search=移远', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('供应商搜索结果:', JSON.stringify(supplierResponse.data, null, 2));
    
    // 测试运营商搜索
    console.log('\n=== 测试运营商搜索 ===');
    const operatorResponse = await axios.get('http://localhost:3000/api/operators?page=1&limit=10&search=移动', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('运营商搜索结果:', JSON.stringify(operatorResponse.data, null, 2));
    
    // 测试快递公司搜索
    console.log('\n=== 测试快递公司搜索 ===');
    const courierResponse = await axios.get('http://localhost:3000/api/couriers?page=1&limit=10&search=顺丰', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('快递公司搜索结果:', JSON.stringify(courierResponse.data, null, 2));
    
    // 测试业务人员搜索
    console.log('\n=== 测试业务人员搜索 ===');
    const staffResponse = await axios.get('http://localhost:3000/api/business-staff?page=1&limit=10&search=陈', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('业务人员搜索结果:', JSON.stringify(staffResponse.data, null, 2));
    
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
  }
}

testSearchFunctionality();