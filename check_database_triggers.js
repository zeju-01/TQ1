// 检查数据库中的触发器和默认值
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkDatabaseTriggers() {
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
    
    // 检查所有触发器
    console.log("\n=== 检查所有触发器 ===");
    const triggers = await queryAsync("SELECT * FROM sqlite_master WHERE type='trigger'");
    if (triggers && triggers.length > 0) {
      console.log("发现触发器:");
      for (const trigger of triggers) {
        console.log(`  名称: ${trigger.name}`);
        console.log(`  表: ${trigger.tbl_name}`);
        console.log(`  SQL: ${trigger.sql}`);
        console.log("---");
      }
    } else {
      console.log("未发现触发器");
    }
    
    // 检查是否有更新inventory表的代码
    console.log("\n=== 检查是否有更新inventory表的代码 ===");
    const updateTriggers = await queryAsync("SELECT * FROM sqlite_master WHERE sql LIKE '%UPDATE%inventory%'");
    if (updateTriggers && updateTriggers.length > 0) {
      console.log("发现可能更新inventory表的代码:");
      for (const trigger of updateTriggers) {
        console.log(`  类型: ${trigger.type}`);
        console.log(`  名称: ${trigger.name}`);
        console.log(`  SQL: ${trigger.sql}`);
        console.log("---");
      }
    } else {
      console.log("未发现可能更新inventory表的代码");
    }
    
    // 检查是否有视图
    console.log("\n=== 检查视图 ===");
    const views = await queryAsync("SELECT * FROM sqlite_master WHERE type='view'");
    if (views && views.length > 0) {
      console.log("发现视图:");
      for (const view of views) {
        console.log(`  名称: ${view.name}`);
        console.log(`  SQL: ${view.sql}`);
        console.log("---");
      }
    } else {
      console.log("未发现视图");
    }
    
    // 检查inventory表的结构
    console.log("\n=== 检查inventory表结构 ===");
    const tableInfo = await queryAsync("PRAGMA table_info(inventory)");
    console.log("inventory表字段:");
    for (const column of tableInfo) {
      console.log(`  ${column.name} (${column.type}) - 允许为空: ${column.notnull ? '否' : '是'}, 默认值: ${column.dflt_value || '无'}`);
    }
    
    db.close();
  } catch (error) {
    console.error("检查过程中出错:", error);
  }
}

checkDatabaseTriggers();