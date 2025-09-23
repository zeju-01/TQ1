// 测试修复后的代码
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testFix() {
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
    
    // 插入一条测试记录，模拟Excel导入的情况
    console.log("\n=== 测试修复后的插入逻辑 ===");
    const stockInData = {
      product_name: "天猫吹风机",  // Excel中提供的产品名称
      product_model: "TmallHairDryer-001",
      operator: "中国移动",
      imei: "777777777777777", // 使用明显不同的IMEI
      batch_number: "BOX001",
      stock_in_quantity: 1,
      supplier: "供应商A",
      factory_order: "FACTORY001",
      stock_in_date: "2025-09-18 10:00:00",
      stock_in_contract_number: "CONTRACT001",
      stock_in_document: "test_document.pdf",
      stock_in_by: "test_user",
      stock_in_notes: "测试备注",
      stock_in_number: "SI202509180003",
      quantity: 1,
      transaction_type: "in"
    };
    
    console.log("要插入的数据:");
    console.log(JSON.stringify(stockInData, null, 2));
    
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
          console.log("✅ 修复成功！product_name字段正确插入!");
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

testFix();