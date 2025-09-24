// 测试搜索API的脚本
const axios = require('axios');

// 配置基础URL
const BASE_URL = 'http://localhost:5002/api';

async function testSearchAPI() {
  try {
    console.log('测试搜索API...');
    
    // 测试1: 搜索合同编号包含"合同编号1"的入库单号
    console.log('\n1. 搜索合同编号包含"合同编号1"的入库单号:');
    try {
      const response1 = await axios.get(`${BASE_URL}/inventory/search-stock-in-numbers`, {
        params: {
          filterType: 'contract_number',
          searchValue: '合同编号1'
        }
      });
      console.log('响应:', response1.data);
    } catch (error) {
      console.log('错误:', error.response ? error.response.data : error.message);
    }
    
    // 测试2: 搜索合同编号完全匹配"合同编号1"的入库单号
    console.log('\n2. 搜索合同编号完全匹配"合同编号1"的入库单号:');
    try {
      const response2 = await axios.get(`${BASE_URL}/inventory/search-stock-in-numbers`, {
        params: {
          filterType: 'contract_number',
          searchValue: '合同编号1'
        }
      });
      console.log('响应:', response2.data);
    } catch (error) {
      console.log('错误:', error.response ? error.response.data : error.message);
    }
    
    // 测试3: 获取特定入库单号的记录
    console.log('\n3. 获取入库单号"SI202509230054"的记录:');
    try {
      const response3 = await axios.get(`${BASE_URL}/inventory/stock-in-records`, {
        params: {
          stockInNumber: 'SI202509230054'
        }
      });
      console.log('响应:', response3.data);
    } catch (error) {
      console.log('错误:', error.response ? error.response.data : error.message);
    }
    
  } catch (error) {
    console.error('测试过程中出现错误:', error.message);
  }
}

// 运行测试
testSearchAPI();