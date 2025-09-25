const axios = require('axios');

// 测试前端库存列表数据
async function checkFrontendData() {
  try {
    console.log('正在测试前端库存列表数据...');
    
    // 发送请求到后端API获取第一页数据
    const response = await axios.get('http://localhost:3001/api/inventory', {
      params: {
        page: 1,
        limit: 20
      }
    });
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据结构:', Object.keys(response.data));
    
    if (response.data.pagination) {
      console.log('分页信息:');
      console.log('  总记录数:', response.data.pagination.total);
      console.log('  当前页:', response.data.pagination.page);
      console.log('  每页数量:', response.data.pagination.limit);
      console.log('  总页数:', response.data.pagination.totalPages);
      console.log('  返回记录数:', response.data.data.length);
    } else {
      console.log('缺少分页信息');
    }
    
    // 获取所有数据以验证总数
    console.log('\n正在获取所有数据以验证总数...');
    let totalRecords = 0;
    let currentPage = 1;
    let hasMore = true;
    
    while (hasMore) {
      const pageResponse = await axios.get('http://localhost:3001/api/inventory', {
        params: {
          page: currentPage,
          limit: 100 // 每页获取100条记录以减少请求次数
        }
      });
      
      const pageData = pageResponse.data;
      const recordsInPage = pageData.data.length;
      totalRecords += recordsInPage;
      
      console.log(`第${currentPage}页: ${recordsInPage}条记录`);
      
      // 检查是否还有更多页面
      if (pageData.pagination) {
        hasMore = pageData.pagination.hasNext;
      } else {
        hasMore = recordsInPage > 0;
      }
      
      currentPage++;
      
      // 防止无限循环
      if (currentPage > 100) {
        console.log('达到最大页数限制，停止获取数据');
        break;
      }
    }
    
    console.log(`\n总计: ${totalRecords}条记录`);
    
  } catch (error) {
    console.error('测试时出错:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
      console.error('错误状态:', error.response.status);
    }
  }
}

// 执行测试
checkFrontendData();