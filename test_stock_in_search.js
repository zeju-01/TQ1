// 测试入库搜索功能的脚本
const axios = require('axios');

// 配置基础URL
const BASE_URL = 'http://localhost:5002/api';

// 测试函数
async function testStockInSearch() {
  try {
    console.log('开始测试入库搜索功能...');
    
    // 1. 测试获取最大入库单号
    console.log('\n1. 测试获取最大入库单号:');
    const maxNumberResponse = await axios.get(`${BASE_URL}/inventory/max-stock-in-number`);
    console.log('响应:', maxNumberResponse.data);
    
    // 2. 测试搜索入库单号 (需要认证令牌)
    console.log('\n2. 测试搜索入库单号:');
    // 注意：这需要有效的认证令牌
    // const searchResponse = await axios.get(`${BASE_URL}/inventory/search-stock-in-numbers`, {
    //   params: {
    //     filterType: 'contract_number',
    //     searchValue: 'CONTRACT001'
    //   },
    //   headers: {
    //     'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
    //   }
    // });
    // console.log('响应:', searchResponse.data);
    
    console.log('\n测试完成。请注意：搜索功能需要有效的认证令牌才能正常工作。');
  } catch (error) {
    console.error('测试过程中出现错误:', error.message);
  }
}

// 运行测试
testStockInSearch();