// 全面测试导入功能修复

// 模拟不同格式的后端响应
const testCases = [
  {
    name: "标准格式响应",
    response: {
      success: true,
      message: 'Excel导入成功',
      data: {
        filename: '测试Excel导入文件.csv',
        rowCount: 2,
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
          }
        ]
      }
    }
  },
  {
    name: "简化数组格式响应",
    response: {
      success: true,
      message: 'Excel导入成功',
      data: [
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
  },
  {
    name: "直接数据格式响应",
    response: {
      success: true,
      message: 'Excel导入成功',
      data: [
        {
          imei: '345678901234567',
          product_name: '天猫吹风机',
          product_model: 'TmallHairDryer-001',
          operator: '中国电信',
          box_number: 'BOX003',
          factory_order: 'FACTORY003',
          quantity: '3',
          contract_number: 'CONTRACT003',
          stock_in_number: 'SI202509180003',
          stock_in_time: '2025-09-18 12:00:00',
          supplier: '供应商C'
        }
      ]
    }
  },
  {
    name: "空数据响应",
    response: {
      success: true,
      message: 'Excel导入成功',
      data: {
        filename: '测试Excel导入文件.csv',
        rowCount: 0,
        data: []
      }
    }
  }
];

// 修复后的处理逻辑
function processImportData(response) {
  console.log('处理响应:', response);
  
  if (response && response.data) {
    const { data } = response;
    console.log('接收到的数据:', data);
    
    // 确保正确提取数据数组
    let rawData = [];
    if (data && Array.isArray(data.data)) {
      // 标准格式: { data: { data: [...] } }
      rawData = data.data;
    } else if (data && Array.isArray(data)) {
      // 简单数组格式: { data: [...] }
      rawData = data;
    } else if (response.data && Array.isArray(response.data)) {
      // 直接数组格式: data: [...]
      rawData = response.data;
    }
    
    console.log('提取的原始数据:', rawData);
    return rawData;
  }
  return [];
}

// 转换数据格式
function convertData(rawData) {
  const convertedData = rawData.map((item, index) => ({
    id: Date.now() + index,
    imei: item.imei || item.IMEI || item['imei'] || '',  // 支持不同的字段名
    product_name: item.product_name || item.productName || item['产品名称'] || '',
    product_model: item.product_model || item.productModel || item['产品型号'] || '',
    operator: item.operator || item.Operator || item['运营商'] || '',
    box_number: item.box_number || item.boxNumber || item['箱号'] || '',
    factory_order: item.factory_order || item.factoryOrder || item['工厂工单'] || '',
    quantity: parseInt(item.quantity) || parseInt(item.Quantity) || parseInt(item['数量']) || 1,
    contract_number: item.contract_number || item.contractNumber || item['合同编号'] || '',
    stock_in_number: item.stock_in_number || item.stockInNumber || item['入库单号'] || '',
    stock_in_time: item.stock_in_time || item.stockInTime || item['入库时间'] || new Date().toISOString().slice(0, 19).replace('T', ' '),
    supplier: item.supplier || item.Supplier || item['供应商'] || '',
    receipt_documents: [],  // 添加收货单据字段
    status: 'pending'
  }));
  
  return convertedData;
}

console.log('=== 全面导入功能测试 ===\n');

testCases.forEach((testCase, index) => {
  console.log(`测试 ${index + 1}: ${testCase.name}`);
  const rawData = processImportData(testCase.response);
  console.log(`  提取数据行数: ${rawData.length}`);
  
  if (rawData.length > 0) {
    const convertedData = convertData(rawData);
    console.log(`  转换后数据行数: ${convertedData.length}`);
    console.log(`  第一行IMEI: ${convertedData[0].imei}`);
  }
  
  console.log('');
});

console.log('=== 测试完成 ===');