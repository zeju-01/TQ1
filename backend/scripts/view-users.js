// 用户信息查看脚本
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'inventory.db');

async function viewUsers() {
  try {
    // 连接数据库
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    console.log('👥 系统用户信息:');
    console.log('==========================================');
    
    // 获取所有用户信息
    const users = await db.all('SELECT * FROM users');
    
    for (const user of users) {
      console.log(`📋 用户ID: ${user.id}`);
      console.log(`👤 用户名: ${user.username}`);
      console.log(`🔐 加密密码: ${user.password}`);
      console.log(`👔 角色: ${user.role}`);
      console.log(`📝 全名: ${user.full_name || '未设置'}`);
      console.log(`🏷️ 缩写: ${user.abbreviation || '未设置'}`);
      console.log(`🔑 权限: ${user.permission}`);
      console.log(`📅 创建时间: ${user.created_at}`);
      console.log(`🔄 更新时间: ${user.updated_at}`);
      console.log('------------------------------------------');
    }

    console.log('\n🔍 常用默认密码信息:');
    console.log('==========================================');
    console.log('📌 管理员默认账号:');
    console.log('   用户名: admin');
    console.log('   默认密码: admin123 (如果使用默认配置)');
    console.log('📚 超级管理员默认账号:');
    console.log('   用户名: superadmin');
    console.log('   默认密码: admin123 (如果使用默认配置)');
    
    console.log('\n🔐 密码验证工具:');
    console.log('==========================================');
    console.log('如需验证特定密码，可以使用以下方法:');
    
    // 提供密码验证示例
    const testPasswords = ['admin123', 'password', '123456'];
    const firstUser = users[0];
    
    if (firstUser) {
      console.log(`\n测试用户 "${firstUser.username}" 的密码:`);
      for (const testPwd of testPasswords) {
        const isMatch = await bcrypt.compare(testPwd, firstUser.password);
        console.log(`   "${testPwd}": ${isMatch ? '✅ 匹配' : '❌ 不匹配'}`);
      }
    }

    await db.close();
    
  } catch (error) {
    console.error('❌ 查看用户信息失败:', error.message);
  }
}

// 运行查看
viewUsers();