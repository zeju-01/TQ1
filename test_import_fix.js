// 测试修复后的导入逻辑

// 模拟后端响应格式（正确的格式）
const correctResponse = {
  success: true,
  message: 'Excel导入成功',
  data: {
    filename: '测试Excel导入文件.csv',
    rowCount: 3,
    data: [
      {
        imei: '123456789012345',
        product_name: '天猫吹风机',
        product_model: 'TmallHairDryer-001',
        operator: '中国移动',
        box_number: 'BOX001',
        factory_order: 'FACTORY001',
        quantity: '1',
        contract_number: 'CONTRACT001',
        stock_in_number: 'SI202509180001',
        stock_in_time: '2025-09-18 10:00:00',
        supplier: '供应商A'
      },
      {
        imei: '234567890123456',
        product_name: '天猫吹风机',
        product_model: 'TmallHairDryer-001',
        operator: '中国联通',
        box_number: 'BOX002',
        factory_order: 'FACTORY002',
        quantity: '2',
        contract_number: 'CONTRACT002',
        stock_in_number: 'SI202509180002',
        stock_in_time: '2025-09-18 11:00:00',
        supplier: '供应商B'
      }
    ]
  }
};

// 模拟后端响应格式（可能的错误格式）
const incorrectResponse = {
  success: true,
  message: 'Excel导入成功',
  data: [
    {
      imei: '123456789012345',
      product_name: '天猫吹风机',
      product_model: 'TmallHairDryer-001',
      operator: '中国移动',
      box_number: 'BOX001',
      factory_order: 'FACTORY001',
      quantity: '1',
      contract_number: 'CONTRACT001',
      stock_in_number: 'SI202509180001',
      stock_in_time: '2025-09-18 10:00:00',
      supplier: '供应商A'
    },
    {
      imei: '234567890123456',
      product_name: '天猫吹风机',
      product_model: 'TmallHairDryer-001',
      operator: '中国联通',
      box_number: 'BOX002',
      factory_order: 'FACTORY002',
      quantity: '2',
      contract_number: 'CONTRACT002',
      stock_in_number: 'SI202509180002',
      stock_in_time: '2025-09-18 11:00:00',
      supplier: '供应商B'
    }
  ]
};

// 修复后的处理逻辑
function processImportData(response) {
  if (response && response.data) {
    const { data } = response;
    console.log('接收到的数据:', data);
    
    // 修复后的逻辑：确保data.data存在且为数组
    const rawData = (data && Array.isArray(data.data)) ? data.data : (Array.isArray(data) ? data : []);
    
    console.log('处理后的原始数据:', rawData);
    return rawData;
  }
  return [];
}

console.log('=== 测试正确的响应格式 ===');
const correctRawData = processImportData(correctResponse);
console.log('提取的数据行数:', correctRawData.length);
if (correctRawData.length > 0) {
  console.log('第一行IMEI:', correctRawData[0].imei);
}

console.log('\n=== 测试可能的错误响应格式 ===');
const incorrectRawData = processImportData(incorrectResponse);
console.log('提取的数据行数:', incorrectRawData.length);
if (incorrectRawData.length > 0) {
  console.log('第一行IMEI:', incorrectRawData[0].imei);
}

console.log('\n=== 测试空响应 ===');
const emptyRawData = processImportData(null);
console.log('提取的数据行数:', emptyRawData.length);