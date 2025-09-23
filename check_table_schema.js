// 检查数据库表结构的脚本
const { executeQuery } = require('./backend/config/database');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkTableSchema() {
  try {
    // 直接连接数据库检查表结构
    const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');
    console.log("数据库路径:", dbPath);
    
    const db = new sqlite3.Database(dbPath);
    
    // 查询inventory表的结构
    db.all("PRAGMA table_info(inventory)", (err, rows) => {
      if (err) {
        console.error("查询表结构失败:", err);
        db.close();
        return;
      }
      
      console.log("Inventory表结构:");
      console.log("字段名\t\t\t类型\t\t是否为空\t默认值\t\t是否为主键");
      console.log("---------------------------------------------------------------------");
      
      for (const column of rows) {
        console.log(
          `${column.name}\t\t\t${column.type}\t\t${column.notnull ? 'NO' : 'YES'}\t\t${column.dflt_value || 'NULL'}\t\t${column.pk ? 'YES' : 'NO'}`
        );
      }
      
      // 特别检查product_name字段
      const productNameColumn = rows.find(col => col.name === 'product_name');
      if (productNameColumn) {
        console.log("\n找到product_name字段:");
        console.log(`- 字段名: ${productNameColumn.name}`);
        console.log(`- 数据类型: ${productNameColumn.type}`);
        console.log(`- 是否允许为空: ${productNameColumn.notnull ? '否' : '是'}`);
        console.log(`- 默认值: ${productNameColumn.dflt_value || '无'}`);
      } else {
        console.log("\n错误: 未找到product_name字段!");
      }
      
      db.close();
    });
  } catch (error) {
    console.error("检查表结构时出错:", error);
  }
}

checkTableSchema();