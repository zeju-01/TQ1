// 检查数据库中是否有预设的记录在影响我们的插入操作
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkPredefinedRecords() {
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
    
    // 检查是否有ID为特定值的记录
    console.log("\n=== 检查特定ID的记录 ===");
    const specificRecords = await queryAsync('SELECT * FROM inventory WHERE id IN (1, 51, 60)');
    if (specificRecords && specificRecords.length > 0) {
      console.log("发现特定ID的记录:");
      for (const record of specificRecords) {
        console.log(`  ID: ${record.id}, product_id: ${record.product_id}, product_name: "${record.product_name}"`);
      }
    } else {
      console.log("未发现特定ID的记录");
    }
    
    // 检查是否有自动更新的记录
    console.log("\n=== 检查最近更新的记录 ===");
    const recentRecords = await queryAsync('SELECT * FROM inventory ORDER BY id DESC LIMIT 10');
    console.log("最近的记录:");
    for (const record of recentRecords) {
      console.log(`  ID: ${record.id}, product_id: ${record.product_id}, product_name: "${record.product_name}", imei: ${record.imei}`);
    }
    
    // 检查是否有默认值或检查约束
    console.log("\n=== 检查表的约束 ===");
    const constraints = await queryAsync("SELECT * FROM sqlite_master WHERE type='table' AND name='inventory'");
    if (constraints && constraints.length > 0) {
      console.log("inventory表定义:");
      console.log(constraints[0].sql);
    }
    
    db.close();
  } catch (error) {
    console.error("检查过程中出错:", error);
  }
}

checkPredefinedRecords();