import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import InventoryController from './controllers/InventoryController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== 开始完整流程测试 ===\n');

// 1. 模拟前端文件上传
console.log('步骤1: 模拟前端文件上传');
const uploadDir = path.join(__dirname, 'uploads');
const testFilename = 'SI202509230007_1.pdf';
const finalPath = path.join(uploadDir, testFilename);

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 创建测试文件
const testContent = '完整流程测试的收货单据文件';
fs.writeFileSync(finalPath, testContent);
console.log('  ✓ 文件上传成功:', testFilename);

// 2. 模拟前端准备入库数据
console.log('\n步骤2: 模拟前端准备入库数据');
const frontendData = {
  product_name: '完整流程测试产品',
  product_model: 'FULL-FLOW-TEST-MODEL-001',
  operator: '完整流程测试运营商',
  imei: '333333333333333',
  batch_number: 'FULL-FLOW-BOX001',
  stock_in_quantity: 2,
  supplier: '完整流程测试供应商',
  factory_order: 'FULL-FLOW-FACTORY001',
  stock_in_contract_number: 'FULL-FLOW-CONTRACT001',
  stock_in_notes: '完整流程测试入库备注',
  stock_in_number: 'SI202509230007',
  stock_in_date: '2025-09-23 12:40:00',
  receipt_documents: [
    {
      name: testFilename,
      response: {
        filename: testFilename
      }
    }
  ]
};

console.log('  前端准备的数据:', frontendData);

// 3. 模拟前端服务处理（inventory.ts中的stockIn函数）
console.log('\n步骤3: 模拟前端服务处理');
let stockInDocument = frontendData.stock_in_document || '';

if (!stockInDocument && frontendData.receipt_documents && frontendData.receipt_documents.length > 0) {
  const fileNames = frontendData.receipt_documents.map((file) => {
    if (file.response && file.response.filename) {
      return file.response.filename;
    }
    return file.name || file.fileName || '收货单据';
  });
  stockInDocument = fileNames.join(', ');
}

const requestData = {
  ...frontendData,
  stock_in_document: stockInDocument
};

console.log('  处理后的请求数据:', requestData);

// 4. 模拟发送到后端API
console.log('\n步骤4: 模拟发送到后端API');
const mockRequest = {
  body: requestData,
  user: {
    username: 'test_user'
  }
};

let responseStatus, responseData;

const mockResponse = {
  status: function(code) {
    responseStatus = code;
    return this;
  },
  json: function(data) {
    responseData = data;
    return this;
  }
};

// 5. 调用后端控制器
console.log('\n步骤5: 调用后端控制器');
await InventoryController.stockIn(mockRequest, mockResponse);

console.log('  响应状态码:', responseStatus);
console.log('  响应数据:', responseData);

// 6. 验证结果
console.log('\n步骤6: 验证结果');
if (responseData && responseData.success) {
  console.log('  ✓ 完整流程测试通过');
  console.log('  ✓ 入库成功');
  if (responseData.data && responseData.data.stock_in_document) {
    console.log('  ✓ stock_in_document 字段正确保存:', responseData.data.stock_in_document);
    
    // 验证是否与我们上传的文件名一致
    if (responseData.data.stock_in_document === testFilename) {
      console.log('  ✓ 文件名匹配正确');
    } else {
      console.log('  ✗ 文件名不匹配');
      console.log('    期望:', testFilename);
      console.log('    实际:', responseData.data.stock_in_document);
    }
  } else {
    console.log('  ✗ stock_in_document 字段未正确保存');
  }
} else {
  console.log('  ✗ 完整流程测试失败');
  if (responseData && responseData.message) {
    console.log('    错误信息:', responseData.message);
  }
}

console.log('\n=== 完整流程测试完成 ===');