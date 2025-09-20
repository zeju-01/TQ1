// 模拟完整的导入过程
const rawData = [
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
];

// 模拟后端响应格式
const backendResponse = {
  success: true,
  message: 'Excel导入成功',
  data: {
    filename: '测试Excel导入文件.csv',
    rowCount: rawData.length,
    data: rawData
  }
};

console.log('模拟后端响应:');
console.log(JSON.stringify(backendResponse, null, 2));

// 模拟前端处理
const { data } = backendResponse;
console.log('\n前端接收到的数据:');
console.log('data:', data);

// 确保data.data存在且为数组
const processedData = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
console.log('处理后的数据数组:', processedData);

// 转换数据格式以匹配批量入库列表
const convertedData = processedData.map((item, index) => ({
  id: Date.now() + index,
  imei: item.imei || item.IMEI || '',  // 支持不同的字段名
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

console.log('\n转换后的数据:');
console.log(JSON.stringify(convertedData, null, 2));

// 检查表格显示数据
console.log('\n表格显示检查:');
convertedData.forEach((item, index) => {
  console.log(`第${index + 1}行数据:`);
  console.log(`  IMEI号: ${item.imei}`);
  console.log(`  产品名称: ${item.product_name}`);
  console.log(`  产品型号: ${item.product_model}`);
  console.log(`  运营商: ${item.operator}`);
  console.log(`  箱号: ${item.box_number}`);
  console.log(`  数量: ${item.quantity}`);
});

// 模拟表格列配置
const batchColumns = [
  {
    title: 'IMEI号',
    dataIndex: 'imei',
    key: 'imei',
  },
  {
    title: '产品名称',
    dataIndex: 'product_name',
    key: 'product_name',
  },
  {
    title: '产品型号',
    dataIndex: 'product_model',
    key: 'product_model',
  },
  {
    title: '运营商',
    dataIndex: 'operator',
    key: 'operator',
  },
  {
    title: '箱号',
    dataIndex: 'box_number',
    key: 'box_number',
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
  }
];

console.log('\n表格列配置:');
console.log(JSON.stringify(batchColumns, null, 2));