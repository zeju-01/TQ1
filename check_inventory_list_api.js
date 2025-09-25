const axios = require('axios');

// 测试获取库存列表API
async function checkInventoryListAPI() {
  try {
    console.log('正在测试库存列表API...');
    
    // 发送请求到后端API
    const response = await axios.get('http://localhost:3001/api/inventory', {
      params: {
        page: 1,
        limit: 20
      }
    });
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', response.data);
    
    if (response.data && response.data.data) {
      console.log('返回的库存记录数:', response.data.data.length);
      console.log('总记录数:', response.data.total);
      console.log('当前页:', response.data.page);
      console.log('每页数量:', response.data.limit);
      
      // 显示前几条记录
      console.log('前5条记录:');
      response.data.data.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}, IMEI: ${item.imei}, 产品: ${item.product_name}`);
      });
    } else {
      console.log('API响应格式不正确');
    }
  } catch (error) {
    console.error('测试API时出错:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
      console.error('错误状态:', error.response.status);
    }
  }
}

// 执行测试
checkInventoryListAPI();