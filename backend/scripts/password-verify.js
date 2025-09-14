// 密码验证工具 - 测试常用密码
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'inventory.db');

async function testPasswords() {
  try {
    // 连接数据库
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    console.log('🔍 密码验证工具');
    console.log('==========================================');
    
    // 获取所有用户
    const users = await db.all('SELECT id, username, password FROM users');
    
    // 常用密码列表
    const commonPasswords = [
      'password',
      'admin123',
      '123456',
      'admin',
      'password123',
      '12345678',
      'qwerty',
      'abc123',
      'admin@123',
      'root',
      'test123',
      '000000',
      '111111',
      '666666',
      '888888',
      '999999'
    ];

    for (const user of users) {
      console.log(`\n👤 用户: ${user.username} (ID: ${user.id})`);
      console.log('------------------------------------------');
      
      let found = false;
      for (const testPwd of commonPasswords) {
        const isMatch = await bcrypt.compare(testPwd, user.password);
        if (isMatch) {
          console.log(`✅ 密码匹配: "${testPwd}"`);
          found = true;
        }
      }
      
      if (!found) {
        console.log('❌ 未在常用密码列表中找到匹配项');
        console.log('💡 提示: 可能使用了自定义密码');
      }
    }

    console.log('\n🔧 如果需要重置密码，请使用以下方法:');
    console.log('1. 通过前端用户管理页面重置');
    console.log('2. 使用密码重置脚本');
    console.log('3. 直接修改数据库（需要重新加密）');

    await db.close();
    
  } catch (error) {
    console.error('❌ 密码验证失败:', error.message);
  }
}

// 自定义密码验证函数
async function verifyCustomPassword(username, testPassword) {
  try {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    const user = await db.get('SELECT username, password FROM users WHERE username = ?', [username]);
    
    if (!user) {
      console.log(`❌ 用户 "${username}" 不存在`);
      return;
    }

    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`🔍 验证用户 "${username}" 密码 "${testPassword}": ${isMatch ? '✅ 匹配' : '❌ 不匹配'}`);

    await db.close();
    return isMatch;
    
  } catch (error) {
    console.error('❌ 密码验证失败:', error.message);
    return false;
  }
}

// 如果提供了命令行参数，进行自定义验证
const args = process.argv.slice(2);
if (args.length === 2) {
  const [username, password] = args;
  console.log(`🔍 自定义密码验证: 用户="${username}", 密码="${password}"`);
  verifyCustomPassword(username, password);
} else {
  // 否则运行常用密码测试
  testPasswords();
}

console.log('\n💡 使用方法:');
console.log('1. 测试常用密码: node password-verify.js');
console.log('2. 验证特定密码: node password-verify.js 用户名 密码');
console.log('   例如: node password-verify.js admin mypassword');