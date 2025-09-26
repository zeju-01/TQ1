const axios = require('axios');

// 测试搜索功能
async function testSearch() {
  try {
    // 测试工厂工单搜索
    const response = await axios.get('http://localhost:3001/api/inventory/search-stock-in-numbers', {
      params: {
        filterType: 'factory_order',
        searchValue: 'M101-SZ2507180003'
      }
    });
    
    console.log('搜索响应:', response.data);
  } catch (error) {
    console.error('搜索失败:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
  }
}

testSearch();