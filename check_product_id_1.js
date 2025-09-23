// 检查products表中ID为1的产品
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkProduct() {
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
    
    // 查询products表中ID为1的产品
    console.log("\n=== 查询products表中ID为1的产品 ===");
    const productResult = await queryAsync('SELECT * FROM products WHERE id = 1');
    if (productResult && productResult.length > 0) {
      console.log("ID为1的产品信息:");
      console.log(JSON.stringify(productResult[0], null, 2));
    } else {
      console.log("未找到ID为1的产品");
    }
    
    // 检查是否有触发器在修改inventory表
    console.log("\n=== 检查是否有触发器在修改inventory表 ===");
    const triggerResult = await queryAsync("SELECT * FROM sqlite_master WHERE type='trigger' AND tbl_name='inventory'");
    if (triggerResult && triggerResult.length > 0) {
      console.log("发现与inventory表相关的触发器:");
      for (const trigger of triggerResult) {
        console.log(`  名称: ${trigger.name}`);
        console.log(`  SQL: ${trigger.sql}`);
        console.log("---");
      }
    } else {
      console.log("未发现与inventory表相关的触发器");
    }
    
    // 检查是否有其他机制在修改数据
    console.log("\n=== 检查是否有其他机制在修改数据 ===");
    // 尝试直接插入一条记录，不设置product_id
    const insertQuery = `
      INSERT INTO inventory (
        product_name, product_model, operator,
        imei, batch_number, stock_in_quantity, stock_in_status, return_status,
        after_sales_status, other_status, supplier,
        factory_order, stock_in_date, stock_in_contract_number,
        stock_in_document, stock_in_by, stock_in_notes, quantity, transaction_type,
        stock_in_number, stock_in_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      "天猫吹风机", "TmallHairDryer-001", "中国移动",
      "666666666666666", "BOX001", 1, '已入库', '正常',
      '正常', '正常', '供应商A',
      'FACTORY001', '2025/9/18 10:00:00', 'CONTRACT001',
      'test_document.pdf', 'test_user', '测试备注', 1, 'in',
      'SI202509180003',
      '2025/9/23 16:34:39', '2025/9/23 16:34:39'
    ];
    
    console.log("尝试插入不带product_id的记录...");
    const insertResult = await new Promise((resolve, reject) => {
      db.run(insertQuery, insertParams, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
    
    console.log("插入结果:", insertResult);
    
    // 查询刚插入的记录
    if (insertResult) {
      const selectResult = await queryAsync('SELECT * FROM inventory WHERE imei = ?', ['666666666666666']);
      if (selectResult && selectResult.length > 0) {
        console.log("\n刚插入的记录:");
        console.log(JSON.stringify(selectResult[0], null, 2));
        
        // 检查product_name字段
        console.log(`\nproduct_name字段值: "${selectResult[0].product_name}"`);
        if (selectResult[0].product_name === "天猫吹风机") {
          console.log("✅ 不带product_id的插入成功！");
        } else {
          console.log("❌ 不带product_id的插入失败！");
        }
      }
    }
    
    db.close();
  } catch (error) {
    console.error("检查过程中出错:", error);
  }
}

checkProduct();