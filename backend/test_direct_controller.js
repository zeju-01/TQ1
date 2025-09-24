// 直接测试控制器方法
const InventoryController = require('./controllers/InventoryController');

// 模拟请求和响应对象
const mockRequest = {
  body: {
    product_name: '直接测试产品',
    product_model: 'DIRECT-TEST-MODEL-001',
    operator: '直接测试运营商',
    imei: '444444444444444',
    batch_number: 'DIRECT-BOX001',
    stock_in_quantity: 1,
    supplier: '直接测试供应商',
    factory_order: 'DIRECT-FACTORY001',
    stock_in_contract_number: 'DIRECT-CONTRACT001',
    stock_in_notes: '直接测试入库备注',
    stock_in_number: 'SI202509230006',
    stock_in_date: '2025-09-23 12:35:00',
    stock_in_document: 'SI202509230006_1.pdf'
  },
  user: {
    username: 'test_user'
  }
};

const mockResponse = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.data = data;
    console.log(`响应状态码: ${this.statusCode}`);
    console.log('响应数据:', data);
    
    // 验证结果
    if (data.success) {
      console.log('\n=== 测试结果 ===');
      console.log('✓ 控制器测试通过');
      console.log('✓ 入库成功');
      if (data.data && data.data.stock_in_document) {
        console.log('✓ stock_in_document 字段正确返回:', data.data.stock_in_document);
      } else {
        console.log('✗ stock_in_document 字段未正确返回');
      }
    } else {
      console.log('\n=== 测试结果 ===');
      console.log('✗ 控制器测试失败:', data.message);
    }
  }
};

console.log('=== 开始直接控制器测试 ===\n');
console.log('发送测试数据:', mockRequest.body);

// 调用控制器方法
InventoryController.stockIn(mockRequest, mockResponse);