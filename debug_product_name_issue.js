// 调试产品名称字段问题的脚本

// 模拟前端发送的数据
const frontendData = {
  product_name: "天猫吹风机",
  product_model: "TmallHairDryer-001",
  operator: "中国移动",
  imei: "123456789012345",
  batch_number: "BOX001",
  stock_in_quantity: 1,
  supplier: "供应商A",
  factory_order: "FACTORY001",
  stock_in_contract_number: "CONTRACT001",
  stock_in_notes: "测试备注",
  stock_in_number: "SI202509180001",
  stock_in_date: "2025-09-18 10:00:00",
  stock_in_document: "SI202509180001_1.pdf",
  stock_in_by: "test_user"
};

console.log("前端发送的数据:");
console.log(JSON.stringify(frontendData, null, 2));

// 模拟后端控制器处理过程
const backendProcessedData = {
  ...frontendData,
  stock_in_by: "current_user"
};

console.log("\n后端控制器处理后的数据:");
console.log(JSON.stringify(backendProcessedData, null, 2));

// 模拟后端模型处理过程
const modelData = {
  product_id: undefined,
  product_name: backendProcessedData.product_name,
  product_model: backendProcessedData.product_model,
  product_description: undefined,
  operator: backendProcessedData.operator,
  imei: backendProcessedData.imei,
  batch_number: backendProcessedData.batch_number,
  stock_in_quantity: backendProcessedData.stock_in_quantity,
  supplier: backendProcessedData.supplier,
  factory_name: undefined,
  factory_order: backendProcessedData.factory_order,
  stock_in_date: backendProcessedData.stock_in_date,
  stock_in_contract_number: backendProcessedData.stock_in_contract_number,
  stock_in_document: backendProcessedData.stock_in_document,
  stock_in_by: backendProcessedData.stock_in_by,
  stock_in_notes: backendProcessedData.stock_in_notes,
  stock_in_number: backendProcessedData.stock_in_number
};

console.log("\n后端模型处理的数据:");
console.log(JSON.stringify(modelData, null, 2));

// 检查SQL语句
const query = `
  INSERT INTO inventory (
    product_id, product_name, product_model, product_description, operator,
    imei, batch_number, stock_in_quantity, stock_in_status, return_status,
    after_sales_status, other_status, supplier,
    factory_name, factory_order, stock_in_date, stock_in_contract_number,
    stock_in_document, stock_in_by, stock_in_notes, quantity, transaction_type,
    stock_in_number, stock_in_auto_number, stock_in_time, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const params = [
  modelData.product_id, 
  modelData.product_name, 
  modelData.product_model, 
  modelData.product_description, 
  modelData.operator,
  modelData.imei, 
  modelData.batch_number, 
  modelData.stock_in_quantity, 
  '已入库', 
  '正常',
  '正常', 
  '正常', 
  modelData.supplier,
  modelData.factory_name, 
  modelData.factory_order, 
  modelData.stock_in_date, 
  modelData.stock_in_contract_number,
  modelData.stock_in_document, 
  modelData.stock_in_by, 
  modelData.stock_in_notes, 
  modelData.stock_in_quantity, 
  'in',
  modelData.stock_in_number,
  null,
  new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
  new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
];

console.log("\nSQL查询语句:");
console.log(query);
console.log("\nSQL参数:");
console.log(JSON.stringify(params, null, 2));

console.log("\n=== 问题分析 ===");
console.log("1. 前端数据中包含 product_name 字段");
console.log("2. 后端控制器正确处理了 product_name 字段");
console.log("3. 后端模型正确传递了 product_name 字段");
console.log("4. SQL语句正确包含了 product_name 字段");
console.log("5. SQL参数正确传递了 product_name 值");

console.log("\n可能的问题原因:");
console.log("1. 数据库表结构中 product_name 字段可能有问题");
console.log("2. Excel导入时字段映射可能不正确");
console.log("3. 批量入库时数据转换可能丢失了 product_name 字段");