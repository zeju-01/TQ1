// 详细测试搜索功能的脚本
const axios = require('axios');

// 配置基础URL
const BASE_URL = 'http://localhost:5002/api';

async function detailedTest() {
  try {
    console.log('详细测试搜索功能...');
    
    // 测试1: 直接检查API端点是否存在
    console.log('\n1. 检查API端点:');
    try {
      const response = await axios.get(`${BASE_URL}/inventory/search-stock-in-numbers`);
      console.log('端点存在，响应状态:', response.status);
    } catch (error) {
      console.log('端点响应状态:', error.response ? error.response.status : '无法连接');
      if (error.response) {
        console.log('错误详情:', error.response.data);
      }
    }
    
    // 测试2: 检查参数验证
    console.log('\n2. 测试参数验证:');
    try {
      const response = await axios.get(`${BASE_URL}/inventory/search-stock-in-numbers`, {
        params: {
          filterType: 'contract_number',
          searchValue: ''
        }
      });
      console.log('参数验证响应:', response.data);
    } catch (error) {
      console.log('参数验证错误:', error.response ? error.response.data : error.message);
    }
    
    // 测试3: 测试数据库查询逻辑
    console.log('\n3. 测试数据库查询逻辑:');
    const { executeQuery } = require('./backend/config/database');
    
    // 模拟后端查询逻辑
    const query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE stock_in_contract_number LIKE ? AND stock_in_number IS NOT NULL AND stock_in_number != ""';
    const params = ['%合同编号1%'];
    
    console.log('执行查询:', query);
    console.log('查询参数:', params);
    
    // 注意：这里我们不能直接执行数据库查询，因为需要在后端环境中执行
    
  } catch (error) {
    console.error('测试过程中出现错误:', error.message);
  }
}

// 运行测试
detailedTest();