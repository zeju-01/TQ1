// 密码重置工具
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'inventory.db');

async function resetUserPassword(username, newPassword) {
  try {
    // 连接数据库
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // 检查用户是否存在
    const user = await db.get('SELECT id, username FROM users WHERE username = ?', [username]);
    
    if (!user) {
      console.log(`❌ 用户 "${username}" 不存在`);
      await db.close();
      return false;
    }

    // 加密新密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    const result = await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?',
      [hashedPassword, username]
    );

    if (result.changes > 0) {
      console.log(`✅ 用户 "${username}" 密码重置成功`);
      console.log(`📝 新密码: "${newPassword}"`);
      console.log(`🔐 加密后: ${hashedPassword}`);
      
      // 验证新密码
      const isMatch = await bcrypt.compare(newPassword, hashedPassword);
      console.log(`🔍 验证新密码: ${isMatch ? '✅ 成功' : '❌ 失败'}`);
    } else {
      console.log(`❌ 密码重置失败`);
    }

    await db.close();
    return true;
    
  } catch (error) {
    console.error('❌ 密码重置失败:', error.message);
    return false;
  }
}

// 批量重置为默认密码
async function resetAllToDefault() {
  try {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    const users = await db.all('SELECT id, username FROM users');
    const defaultPassword = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    console.log('🔄 批量重置所有用户密码为默认密码...');
    console.log(`📝 默认密码: "${defaultPassword}"`);
    
    for (const user of users) {
      await db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, user.id]
      );
      console.log(`✅ 用户 "${user.username}" 密码已重置`);
    }

    await db.close();
    console.log('\n🎉 所有用户密码重置完成！');
    
  } catch (error) {
    console.error('❌ 批量重置失败:', error.message);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🔧 密码重置工具');
  console.log('==========================================');
  console.log('💡 使用方法:');
  console.log('1. 重置特定用户密码: node password-reset.js 用户名 新密码');
  console.log('   例如: node password-reset.js admin newpassword123');
  console.log('2. 重置所有用户为默认密码: node password-reset.js --reset-all');
  console.log('');
  console.log('⚠️ 注意: 此操作会永久修改数据库中的密码！');
} else if (args[0] === '--reset-all') {
  resetAllToDefault();
} else if (args.length === 2) {
  const [username, newPassword] = args;
  resetUserPassword(username, newPassword);
} else {
  console.log('❌ 参数错误，请查看使用方法');
}