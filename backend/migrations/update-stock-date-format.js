// 数据库迁移脚本：更新入库和出库时间字段格式
// 将 stock_in_date 和 stock_out_date 字段从 DATETIME 改为 DATE 格式

const { executeQuery } = require('../config/database');

const migration = {
  name: 'update-stock-date-format',
  description: '更新入库和出库时间字段格式为 YYYY-MM-DD',
  
  async up() {
    try {
      console.log('开始执行数据库迁移：更新入库和出库时间字段格式');
      
      // 1. 添加临时字段
      console.log('1. 添加临时字段');
      await executeQuery(`
        ALTER TABLE inventory 
        ADD COLUMN temp_stock_in_date DATE,
        ADD COLUMN temp_stock_out_date DATE
      `);
      
      // 2. 将现有数据从 DATETIME 字段复制到临时 DATE 字段
      console.log('2. 复制数据到临时字段');
      await executeQuery(`
        UPDATE inventory 
        SET temp_stock_in_date = DATE(stock_in_date),
            temp_stock_out_date = DATE(stock_out_date)
      `);
      
      // 3. 删除旧的 DATETIME 字段
      console.log('3. 删除旧字段');
      await executeQuery(`
        ALTER TABLE inventory 
        DROP COLUMN stock_in_date,
        DROP COLUMN stock_out_date
      `);
      
      // 4. 重新创建 DATE 类型字段
      console.log('4. 重新创建 DATE 类型字段');
      await executeQuery(`
        ALTER TABLE inventory 
        ADD COLUMN stock_in_date DATE NULL,
        ADD COLUMN stock_out_date DATE NULL
      `);
      
      // 5. 将数据从临时字段复制到新的 DATE 字段
      console.log('5. 复制数据到新字段');
      await executeQuery(`
        UPDATE inventory 
        SET stock_in_date = temp_stock_in_date,
            stock_out_date = temp_stock_out_date
      `);
      
      // 6. 删除临时字段
      console.log('6. 删除临时字段');
      await executeQuery(`
        ALTER TABLE inventory 
        DROP COLUMN temp_stock_in_date,
        DROP COLUMN temp_stock_out_date
      `);
      
      console.log('数据库迁移完成：入库和出库时间字段格式已更新为 YYYY-MM-DD');
      return true;
    } catch (error) {
      console.error('数据库迁移失败:', error);
      return false;
    }
  },
  
  async down() {
    try {
      console.log('回滚数据库迁移：恢复入库和出库时间字段格式为 DATETIME');
      
      // 1. 添加临时字段（DATETIME类型）
      console.log('1. 添加临时字段');
      await executeQuery(`
        ALTER TABLE inventory 
        ADD COLUMN temp_stock_in_date DATETIME,
        ADD COLUMN temp_stock_out_date DATETIME
      `);
      
      // 2. 将现有数据从 DATE 字段复制到临时 DATETIME 字段
      console.log('2. 复制数据到临时字段');
      await executeQuery(`
        UPDATE inventory 
        SET temp_stock_in_date = DATETIME(stock_in_date),
            temp_stock_out_date = DATETIME(stock_out_date)
      `);
      
      // 3. 删除旧的 DATE 字段
      console.log('3. 删除旧字段');
      await executeQuery(`
        ALTER TABLE inventory 
        DROP COLUMN stock_in_date,
        DROP COLUMN stock_out_date
      `);
      
      // 4. 重新创建 DATETIME 类型字段
      console.log('4. 重新创建 DATETIME 类型字段');
      await executeQuery(`
        ALTER TABLE inventory 
        ADD COLUMN stock_in_date DATETIME NULL,
        ADD COLUMN stock_out_date DATETIME NULL
      `);
      
      // 5. 将数据从临时字段复制到新的 DATETIME 字段
      console.log('5. 复制数据到新字段');
      await executeQuery(`
        UPDATE inventory 
        SET stock_in_date = temp_stock_in_date,
            stock_out_date = temp_stock_out_date
      `);
      
      // 6. 删除临时字段
      console.log('6. 删除临时字段');
      await executeQuery(`
        ALTER TABLE inventory 
        DROP COLUMN temp_stock_in_date,
        DROP COLUMN temp_stock_out_date
      `);
      
      console.log('数据库迁移回滚完成：入库和出库时间字段格式已恢复为 DATETIME');
      return true;
    } catch (error) {
      console.error('数据库迁移回滚失败:', error);
      return false;
    }
  }
};

module.exports = migration;