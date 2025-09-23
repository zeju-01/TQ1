// 测试数据库插入过程的脚本
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testDatabaseInsert() {
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
    
    // 检查products表
    console.log("=== 检查products表 ===");
    try {
      const productsResult = await queryAsync("SELECT * FROM products");
      console.log("products表记录数:", productsResult.length);
      console.log("products表内容:");
      for (const product of productsResult) {
        console.log(`  ID: ${product.id}, 名称: "${product.name}", 型号: ${product.model}`);
      }
    } catch (e) {
      console.log("查询products表失败:", e.message);
    }
    
    // 检查是否有更新inventory表的代码逻辑
    console.log("\n=== 检查inventory表更新逻辑 ===");
    
    // 检查是否有product_id字段并且不为空的情况
    const productIdCheck = await queryAsync("SELECT id, product_id, product_name FROM inventory WHERE product_id IS NOT NULL LIMIT 5");
    console.log("有product_id的记录:");
    for (const record of productIdCheck) {
      console.log(`  ID: ${record.id}, product_id: ${record.product_id}, product_name: "${record.product_name}"`);
    }
    
    // 检查后端模型代码中是否有根据product_id更新product_name的逻辑
    console.log("\n=== 检查后端模型代码 ===");
    const fs = require('fs');
    const modelPath = path.join(__dirname, 'backend', 'models', 'Inventory.js');
    if (fs.existsSync(modelPath)) {
      const modelContent = fs.readFileSync(modelPath, 'utf8');
      console.log("检查Inventory.js中是否有根据product_id更新product_name的逻辑...");
      
      // 查找是否有根据product_id查询产品信息并更新的代码
      if (modelContent.includes('ProductModel') || modelContent.includes('findById') || modelContent.includes('product_id')) {
        console.log("✅ 发现可能与ProductModel相关的代码");
        
        // 查找具体的处理逻辑
        const lines = modelContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('product_id')) {
            console.log(`  行${i+1}: ${lines[i].trim()}`);
          }
        }
      } else {
        console.log("❌ 未发现与ProductModel相关的代码");
      }
    } else {
      console.log("❌ 未找到Inventory.js文件");
    }
    
    db.close();
  } catch (error) {
    console.error("测试过程中出错:", error);
  }
}

testDatabaseInsert();