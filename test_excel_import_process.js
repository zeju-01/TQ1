// 测试Excel导入和批量入库过程的脚本

// 模拟Excel导入后的数据（前端接收到的数据）
const excelImportResponse = {
  success: true,
  message: 'Excel导入成功',
  data: {
    filename: '测试Excel导入文件.xlsx',
    rowCount: 2,
    data: [
      {
        "IMEI号": "123456789012345",
        "产品名称": "天猫吹风机",
        "产品型号": "TmallHairDryer-001",
        "运营商": "中国移动",
        "箱号": "BOX001",
        "工厂工单": "FACTORY001",
        "数量": "1",
        "合同编号": "CONTRACT001",
        "入库单号": "SI202509180001",
        "入库时间": "2025-09-18 10:00:00",
        "供应商": "供应商A",
        "备注": "备注示例A"
      },
      {
        "IMEI号": "234567890123456",
        "产品名称": "天猫吹风机",
        "产品型号": "TmallHairDryer-001",
        "运营商": "中国联通",
        "箱号": "BOX002",
        "工厂工单": "FACTORY002",
        "数量": "2",
        "合同编号": "CONTRACT002",
        "入库单号": "SI202509180002",
        "入库时间": "2025-09-18 11:00:00",
        "供应商": "供应商B",
        "备注": "备注示例B"
      }
    ]
  }
};

console.log("1. Excel导入响应数据:");
console.log(JSON.stringify(excelImportResponse, null, 2));

// 模拟前端处理导入数据的过程
const importedData = excelImportResponse.data.data || excelImportResponse.data;
console.log("\n2. 提取的导入数据:");
console.log(JSON.stringify(importedData, null, 2));

// 模拟前端表单数据
const formValues = {
  product_name: "天猫吹风机", // 从下拉选择的产品名称
  product_model: "TmallHairDryer-001",
  operator: "中国移动",
  supplier: "供应商A",
  factory_order: "FACTORY001",
  contract_number: "CONTRACT001",
  remark: "测试备注",
  stock_in_number: "SI202509180001",
  stock_in_date: "2025-09-18 10:00:00",
  quantity: 1
};

console.log("\n3. 前端表单数据:");
console.log(JSON.stringify(formValues, null, 2));

// 模拟前端转换数据格式的过程
const convertedData = importedData.map((item, index) => {
  // 获取表单中的非空值（除IMEI和箱号外）
  const formData = {};
  
  // 只有当表单字段不为空时才使用表单值（排除IMEI和箱号）
  if (formValues.operator) formData.operator = formValues.operator;
  if (formValues.supplier) formData.supplier = formValues.supplier;
  if (formValues.factory_order) formData.factory_order = formValues.factory_order;
  if (formValues.contract_number) formData.contract_number = formValues.contract_number;
  if (formValues.remark) formData.remark = formValues.remark;
  if (formValues.stock_in_number) formData.stock_in_number = formValues.stock_in_number;
  if (formValues.stock_in_date) formData.stock_in_date = formValues.stock_in_date;
  
  return {
    id: Date.now() + index,
    imei: item.imei || item.IMEI || item['IMEI号'] || '',  // 添加对"IMEI号"字段的支持
    product_name: item.product_name || item.productName || item['产品名称'] || formValues.product_name || '',
    product_model: item.product_model || item.productModel || item['产品型号'] || formValues.product_model || '',
    operator: item.operator || item.Operator || item['运营商'] || formData.operator || '',
    box_number: item.box_number || item.boxNumber || item['箱号'] || '',
    factory_order: item.factory_order || item.factoryOrder || item['工厂工单'] || formData.factory_order || '',
    quantity: parseInt(item.quantity) || parseInt(item.Quantity) || parseInt(item['数量']) || formValues.quantity || 1,
    contract_number: item.contract_number || item.contractNumber || item['合同编号'] || formData.contract_number || '',
    stock_in_number: item.stock_in_number || item.stockInNumber || item['入库单号'] || formData.stock_in_number || '',
    stock_in_date: item.stock_in_date || item.stockInTime || item['入库时间'] || formData.stock_in_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
    supplier: item.supplier || item.Supplier || item['供应商'] || formData.supplier || '',
    remark: item.remark || item.Remark || item['备注'] || formData.remark || '',
    receipt_documents: [], // 保存原始文件对象，用于后续上传
    stock_in_document: '', // 保存预期的文件名
    custom_file_names: [], // 保存自定义文件名数组
    status: 'pending'
  };
});

console.log("\n4. 转换后的数据:");
console.log(JSON.stringify(convertedData, null, 2));

// 检查转换后的数据中product_name字段
console.log("\n5. 检查转换后的数据中的product_name字段:");
convertedData.forEach((item, index) => {
  console.log(`第${index + 1}行: product_name = "${item.product_name}"`);
});

// 模拟发送到后端的数据
const backendStockInList = convertedData.map(item => {
  const result = {
    product_id: typeof item.product_name === 'number' ? item.product_name : undefined,
    product_name: typeof item.product_name === 'string' ? item.product_name : undefined,
    product_model: item.product_model || '',
    operator: item.operator || '',
    imei: item.imei || '',
    batch_number: item.box_number || '',
    stock_in_quantity: item.quantity || 1,
    supplier: item.supplier || '',
    factory_order: item.factory_order || '',
    stock_in_contract_number: item.contract_number || '',
    stock_in_notes: item.remark || '',
    // 添加入库单号字段
    stock_in_number: item.stock_in_number || '',
    // 修复字段名不匹配的问题：前端使用 stock_in_date，后端需要 stock_in_date
    stock_in_date: item.stock_in_date || new Date().toISOString(),
    stock_in_by: 'current_user', // 这里应该从认证信息中获取当前用户
    // 直接使用已有的收货单据信息
    stock_in_document: item.stock_in_document || undefined
  };
  
  return result;
});

console.log("\n6. 发送到后端的数据:");
console.log(JSON.stringify(backendStockInList, null, 2));

// 检查发送到后端的数据中product_name字段
console.log("\n7. 检查发送到后端的数据中的product_name字段:");
backendStockInList.forEach((item, index) => {
  console.log(`第${index + 1}行: product_name = "${item.product_name}"`);
});

console.log("\n=== 问题分析 ===");
console.log("通过以上步骤可以看出:");
console.log("1. Excel导入的数据中包含'产品名称'字段");
console.log("2. 前端转换过程中正确提取了产品名称");
console.log("3. 发送到后端的数据中包含product_name字段");
console.log("4. 如果数据库中product_name字段为空，可能是以下原因:");
console.log("   a. 数据库插入时字段映射错误");
console.log("   b. 后端模型处理时丢失了product_name字段");
console.log("   c. SQL执行时参数传递错误");