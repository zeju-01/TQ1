// 模拟前端产品服务调用
const axios = require('axios');

// 模拟前端产品服务
const productService = {
  async getList(params) {
    try {
      // 模拟前端的参数转换
      const backendParams = {
        page: params?.page,
        limit: params?.limit,
        search: params?.search
      };
      
      console.log('发送请求到:', 'http://localhost:5000/api/products', backendParams);
      
      const response = await axios.get('http://localhost:5000/api/products', { 
        params: backendParams,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('响应数据:', {
        success: response.data.success,
        dataLength: response.data.data?.length,
        pagination: response.data.pagination
      });
      
      return {
        data: response.data.data,
        total: response.data.pagination.total
      };
    } catch (error) {
      console.error('产品服务getList错误:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

async function testProductService() {
  try {
    console.log('测试前端产品服务...');
    
    // 测试获取产品列表
    console.log('1. 测试获取产品列表:');
    const result = await productService.getList({ page: 1, limit: 100 });
    console.log('获取产品列表成功:', result.data.length, '条记录');
    
    // 显示前几条数据
    result.data.slice(0, 3).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.model})`);
    });
    
    console.log('测试完成!');
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testProductService();