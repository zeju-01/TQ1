// 用户数据模型
const { promisePool, executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');
const { getBeijingTime } = require('../utils/timeUtils');

class UserModel {
  // 创建用户
  static async create(userData) {
    try {
      const { username, password, role = 'user', full_name, abbreviation, permission = 'view', remarks } = userData;
      
      // 检查用户名是否已存在
      const existingUser = await this.findByUsername(username);
      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 加密密码
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO users (username, password, role, full_name, abbreviation, permission, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [username, hashedPassword, role, full_name, abbreviation, permission, remarks];
      const result = await executeQuery(query, params);
      
      if (result.success) {
        return await this.findById(result.data.insertId);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    }
  }

  // 根据ID查找用户
  static async findById(id) {
    try {
      const query = 'SELECT id, username, role, full_name, abbreviation, permission, remarks, created_at, updated_at, last_login FROM users WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据用户名查找用户
  static async findByUsername(username) {
    try {
      const query = 'SELECT id, username, role, full_name, abbreviation, permission, remarks, created_at, updated_at, last_login FROM users WHERE username = ?';
      const result = await executeQuery(query, [username]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据用户名查找用户（包含密码，用于登录验证）
  static async findByUsernameWithPassword(username) {
    try {
      const query = 'SELECT * FROM users WHERE username = ?';
      const result = await executeQuery(query, [username]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 更新最后登录时间
  static async updateLastLogin(userId) {
    try {
      const beijingTime = getBeijingTime();
      const query = 'UPDATE users SET last_login = ? WHERE id = ?';
      const result = await executeQuery(query, [beijingTime, userId]);
      return result.success;
    } catch (error) {
      throw error;
    }
  }

  // 验证密码
  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  // 更新用户信息
  static async updateById(id, userData) {
    try {
      const { role, full_name, abbreviation, permission, remarks } = userData;
      
      const beijingTime = getBeijingTime();
      const query = `
        UPDATE users 
        SET role = ?, full_name = ?, abbreviation = ?, permission = ?, remarks = ?, updated_at = ?
        WHERE id = ?
      `;
      
      const params = [role, full_name, abbreviation, permission, remarks, beijingTime, id];
      const result = await executeQuery(query, params);
      
      if (result.success) {
        return await this.findById(id);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    }
  }

  // 更新密码
  static async updatePassword(id, newPassword) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const beijingTime = getBeijingTime();
      const query = 'UPDATE users SET password = ?, updated_at = ? WHERE id = ?';
      const result = await executeQuery(query, [hashedPassword, beijingTime, id]);
      
      return result.success;
    } catch (error) {
      throw error;
    }
  }

  // 获取所有用户（分页）
  static async findAll(page = 1, limit = 20, search = '') {
    try {
      let query = `
        SELECT id, username, role, full_name, abbreviation, permission, remarks, created_at, updated_at, last_login
        FROM users
      `;
      let countQuery = 'SELECT COUNT(*) as total FROM users';
      const params = [];

      // 添加搜索条件
      if (search) {
        const searchCondition = ' WHERE username LIKE ? OR full_name LIKE ? OR abbreviation LIKE ?';
        query += searchCondition;
        countQuery += searchCondition;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // 添加排序和分页
      const offset = (page - 1) * limit;
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      // 执行查询
      const [dataResult, countResult] = await Promise.all([
        executeQuery(query, params),
        executeQuery(countQuery, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])
      ]);

      if (dataResult.success && countResult.success) {
        return {
          users: dataResult.data,
          total: countResult.data[0].total,
          page,
          limit
        };
      } else {
        throw new Error('查询用户列表失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 删除用户
  static async deleteById(id) {
    try {
      const query = 'DELETE FROM users WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (!result.success) {
        throw new Error('删除用户失败：数据库操作错误');
      }
      
      // SQLite的删除结果中使用changes字段表示受影响的行数
      if (result.data.changes === 0) {
        throw new Error('删除用户失败：未找到要删除的记录');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 检查用户权限
  static hasPermission(user, requiredPermission) {
    const permissionLevels = {
      'view': 1,
      'operate': 2,
      'manage': 3,
      'admin': 4,
      'all': 4  // 两种表示都支持
    };

    const userLevel = permissionLevels[user.permission] || 0;
    const requiredLevel = permissionLevels[requiredPermission] || 0;

    return userLevel >= requiredLevel;
  }

  // 检查用户角色
  static hasRole(user, requiredRoles) {
    if (typeof requiredRoles === 'string') {
      return user.role === requiredRoles;
    }
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    
    return false;
  }
}

module.exports = UserModel;