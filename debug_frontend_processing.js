// 模拟前端处理过程
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
  },
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
];

// 模拟前端转换逻辑
const convertedData = rawData.map((item, index) => ({
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

console.log('转换后的数据:');
console.log(JSON.stringify(convertedData, null, 2));

// 检查imei字段
console.log('\n检查imei字段:');
convertedData.forEach((item, index) => {
  console.log(`第${index + 1}行:`, item.imei, `(类型: ${typeof item.imei})`);
});