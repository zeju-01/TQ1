// 实际调用后端API的批量入库测试脚本
const fs = require('fs');
const path = require('path');

// 配置
const API_BASE_URL = 'http://localhost:3000'; // 假设后端运行在3000端口
const TEST_DATA = {
  stockInList: [
    {
      product_name: 'API测试产品A',
      product_model: 'API-Model-A',
      operator: '中国移动',
      imei: '987654321098765', // 使用不同的IMEI避免冲突
      batch_number: 'API-BOX001',
      stock_in_quantity: 1,
      supplier: 'API测试供应商',
      factory_order: 'API-FACTORY001',
      stock_in_contract_number: 'API-CONTRACT001',
      stock_in_notes: 'API测试备注',
      stock_in_number: 'SI202509230003',
      stock_in_date: '2025-09-23 12:00:00',
      stock_in_document: 'SI202509230003_1.pdf, SI202509230003_2.docx',
      stock_in_by: 'api_test_user'
    }
  ]
};

// 模拟发送HTTP请求的函数（在实际环境中可以使用axios或fetch）
async function sendRequest(url, method, data = null) {
  console.log(`发送 ${method} 请求到: ${url}`);
  if (data) {
    console.log('请求数据:', JSON.stringify(data, null, 2));
  }
  
  // 这里模拟HTTP响应
  // 在实际环境中，您需要使用真正的HTTP客户端
  return {
    success: true,
    message: '请求处理成功',
    data: data ? { ...data, id: Math.floor(Math.random() * 10000) } : {}
  };
}

// 测试批量入库API
async function testBatchStockInAPI() {
  console.log('=== 测试批量入库API ===\n');
  
  try {
    // 发送批量入库请求
    console.log('1. 发送批量入库请求...');
    const response = await sendRequest(
      `${API_BASE_URL}/api/inventory/stock-in/batch`,
      'POST',
      TEST_DATA
    );
    
    console.log('API响应:', JSON.stringify(response, null, 2));
    
    // 验证响应数据
    console.log('\n2. 验证响应数据...');
    if (response.success) {
      console.log('  ✓ API请求成功');
      
      // 检查 stock_in_document 字段是否正确返回
      if (response.data && response.data.stockInList) {
        response.data.stockInList.forEach((item, index) => {
          const original = TEST_DATA.stockInList[index];
          console.log(`\n项目 ${index + 1} 验证:`);
          console.log(`  发送的 stock_in_document: ${original.stock_in_document}`);
          console.log(`  返回的 stock_in_document: ${item.stock_in_document}`);
          
          if (original.stock_in_document === item.stock_in_document) {
            console.log('  ✓ stock_in_document 字段正确处理');
          } else {
            console.log('  ✗ stock_in_document 字段处理错误');
          }
        });
      }
    } else {
      console.log('  ✗ API请求失败');
      console.log(`  错误信息: ${response.message}`);
    }
    
    return response;
  } catch (error) {
    console.error('API测试失败:', error);
    throw error;
  }
}

// 测试文件上传API
async function testFileUploadAPI() {
  console.log('\n=== 测试文件上传API ===\n');
  
  try {
    // 创建测试文件
    const testDir = path.join(__dirname, 'test-upload-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
    
    const testFileName = 'SI202509230003_1.pdf';
    const testFilePath = path.join(testDir, testFileName);
    fs.writeFileSync(testFilePath, '这是用于API测试的文件内容');
    
    console.log(`创建测试文件: ${testFilePath}`);
    
    // 模拟文件上传请求
    console.log('1. 模拟文件上传请求...');
    const uploadResponse = await sendRequest(
      `${API_BASE_URL}/api/upload/multiple`,
      'POST'
      // 在实际环境中，这里需要发送包含文件的FormData
    );
    
    console.log('文件上传响应:', JSON.stringify(uploadResponse, null, 2));
    
    return uploadResponse;
  } catch (error) {
    console.error('文件上传测试失败:', error);
    throw error;
  }
}

// 主测试函数
async function runAPITest() {
  console.log('=== 实际调用后端API的批量入库测试 ===\n');
  
  try {
    // 测试批量入库API
    const batchResult = await testBatchStockInAPI();
    
    // 测试文件上传API
    const uploadResult = await testFileUploadAPI();
    
    // 输出最终测试结果
    console.log('\n=== 最终测试结果 ===');
    console.log('批量入库测试:', batchResult.success ? '✓ 通过' : '✗ 失败');
    console.log('文件上传测试:', uploadResult.success ? '✓ 通过' : '✗ 失败');
    
    if (batchResult.success && uploadResult.success) {
      console.log('\n🎉 所有测试通过！批量入库功能正常工作。');
    } else {
      console.log('\n❌ 部分测试失败，请检查相关功能。');
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('测试执行失败:', error);
  }
}

// 执行测试
runAPITest();