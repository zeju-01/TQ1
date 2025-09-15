const { executeQuery } = require('./backend/config/database');

async function clearDatabase() {
  try {
    console.log('开始清空数据库...');
    
    // 清空库存表
    console.log('清空库存表...');
    await executeQuery('DELETE FROM inventory');
    console.log('库存表已清空');
    
    // 清空产品表
    console.log('清空产品表...');
    await executeQuery('DELETE FROM products');
    console.log('产品表已清空');
    
    // 清空供应商表
    console.log('清空供应商表...');
    await executeQuery('DELETE FROM suppliers');
    console.log('供应商表已清空');
    
    // 清空业务人员表
    console.log('清空业务人员表...');
    await executeQuery('DELETE FROM business_staff');
    console.log('业务人员表已清空');
    
    // 清空运营商表
    console.log('清空运营商表...');
    await executeQuery('DELETE FROM operators');
    console.log('运营商表已清空');
    
    // 清空快递公司表
    console.log('清空快递公司表...');
    await executeQuery('DELETE FROM couriers');
    console.log('快递公司表已清空');
    
    // 清空用户表（保留默认管理员账户）
    console.log('清空用户表（保留默认管理员账户）...');
    await executeQuery("DELETE FROM users WHERE username NOT IN ('admin', 'superadmin')");
    console.log('用户表已清空（保留默认管理员账户）');
    
    console.log('数据库清空完成！');
  } catch (error) {
    console.error('清空数据库失败:', error);
  }
}

// 执行清空操作
clearDatabase();