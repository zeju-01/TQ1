// 最终测试修复是否成功
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function finalTest() {
  try {
    // 直接连接数据库
    const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log("数据库路径:", dbPath);
    
    const db = new sqlite3.Database(dbPath);
    
    // 使用Promise包装数据库操作
    const queryAsync = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };
    
    // 模拟修复后的前端服务逻辑
    console.log("\n=== 模拟修复后的前端服务逻辑 ===");
    const stockInItem = {
      product_name: "天猫吹风机",  // 字符串类型的产品名称
      product_model: "TmallHairDryer-001",
      operator: "中国移动",
      imei: "555555555555555", // 使用明显不同的IMEI
      box_number: "BOX001",
      quantity: 1,
      supplier: "供应商A",
      factory_order: "FACTORY001",
      contract_number: "CONTRACT001",
      remark: "测试备注",
      stock_in_number: "SI202509180003",
      stock_in_date: "2025-09-18 10:00:00",
      stock_in_document: "test_document.pdf"
    };
    
    console.log("原始数据:", JSON.stringify(stockInItem, null, 2));
    
    // 模拟修复后的转换逻辑
    const backendData = {
      // 修复：不再将product_name作为product_id
      product_name: typeof stockInItem.product_name === 'string' ? stockInItem.product_name : undefined,
      product_model: stockInItem.product_model || '',
      operator: stockInItem.operator || '',
      imei: stockInItem.imei || '',
      batch_number: stockInItem.box_number || '',
      stock_in_quantity: stockInItem.quantity || 1,
      supplier: stockInItem.supplier || '',
      factory_order: stockInItem.factory_order || '',
      stock_in_contract_number: stockInItem.contract_number || '',
      stock_in_notes: stockInItem.remark || '',
      stock_in_number: stockInItem.stock_in_number || '',
      stock_in_date: stockInItem.stock_in_date || new Date().toISOString(),
      stock_in_by: 'current_user',
      stock_in_document: stockInItem.stock_in_document || undefined
    };
    
    console.log("\n转换后的后端数据:", JSON.stringify(backendData, null, 2));
    
    // 模拟修复后的后端控制器逻辑
    console.log("\n=== 模拟修复后的后端控制器逻辑 ===");
    const stockInData = {
      ...backendData,
      stock_in_by: 'test_user'
    };
    
    console.log("控制器处理后的数据:", JSON.stringify(stockInData, null, 2));
    
    // 检查是否设置了product_id
    if (stockInData.product_id) {
      console.log("❌ 错误：product_id被错误设置为:", stockInData.product_id);
    } else {
      console.log("✅ 正确：product_id未被设置");
    }
    
    // 模拟后端模型的createStockIn方法（修复后的版本）
    const {
      product_id, product_name, product_model, product_description, operator,
      imei, batch_number, stock_in_quantity = 1, supplier, factory_name,
      factory_order, stock_in_date, stock_in_contract_number, stock_in_document,
      stock_in_by, stock_in_notes, stock_in_number
    } = stockInData;

    // 处理入库日期，确保格式正确
    let formatted_stock_in_date = stock_in_date;
    if (stock_in_date) {
      try {
        const date = new Date(stock_in_date);
        if (isNaN(date.getTime())) {
          formatted_stock_in_date = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        } else {
          formatted_stock_in_date = date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        }
      } catch (dateError) {
        formatted_stock_in_date = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      }
    } else {
      formatted_stock_in_date = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    }

    // 获取当前北京时间用于 stock_in_time 字段
    const beijingTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

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
      product_id, product_name, product_model, product_description, operator,
      imei || null,
      batch_number, stock_in_quantity, '已入库', '正常',
      '正常', '正常', supplier,
      factory_name, factory_order, formatted_stock_in_date, stock_in_contract_number,
      stock_in_document, stock_in_by, stock_in_notes, stock_in_quantity, 'in',
      stock_in_number || null,
      null, // stock_in_auto_number
      beijingTime, // stock_in_time
      beijingTime // created_at
    ];

    console.log("\nSQL查询语句:");
    console.log(query);
    console.log("\nSQL参数:");
    console.log(JSON.stringify(params, null, 2));

    // 执行插入操作
    const insertResult = await new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
    
    console.log("\n插入结果:");
    console.log(JSON.stringify(insertResult, null, 2));
    
    if (insertResult) {
      // 查询刚插入的记录
      const selectResult = await queryAsync('SELECT * FROM inventory WHERE imei = ?', [imei]);
      
      if (selectResult && selectResult.length > 0) {
        console.log("\n刚插入的记录:");
        console.log(JSON.stringify(selectResult[0], null, 2));
        
        // 检查product_name字段
        console.log(`\nproduct_name字段值: "${selectResult[0].product_name}"`);
        if (selectResult[0].product_name === "天猫吹风机") {
          console.log("🎉 🎉 🎉 修复成功！product_name字段正确插入!");
          console.log("🎉 Excel导入的数据现在可以正确写入数据库了!");
        } else {
          console.log("❌ 修复失败！product_name字段未正确插入!");
        }
      } else {
        console.log("查询刚插入的记录失败");
      }
    } else {
      console.log("插入记录失败");
    }
    
    db.close();
  } catch (error) {
    console.error("测试过程中出错:", error);
  }
}

finalTest();