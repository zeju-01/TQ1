// 业务人员数据模型
const { executeQuery } = require('../config/database');
const { getBeijingTime } = require('../utils/timeUtils');

class BusinessStaffModel {
  // 创建业务人员
  static async create(staffData) {
    try {
      const { staff_name, nickname, position, department, phone, email, contact_info } = staffData;
      
      // 检查业务人员姓名是否已存在
      const existingStaff = await this.findByName(staff_name);
      if (existingStaff) {
        throw new Error('业务人员姓名已存在');
      }

      const query = `
        INSERT INTO business_staff (staff_name, nickname, position, department, phone, email, contact_info, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `;
      
      const params = [staff_name, nickname, position, department, phone, email, contact_info];
      const result = await executeQuery(query, params);
      
      if (result.success) {
        return await this.findById(result.data.lastID);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    }
  }

  // 根据ID查找业务人员
  static async findById(id) {
    try {
      const query = 'SELECT * FROM business_staff WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据姓名查找业务人员
  static async findByName(staff_name) {
    try {
      const query = 'SELECT * FROM business_staff WHERE staff_name = ?';
      const result = await executeQuery(query, [staff_name]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据花名查找业务人员
  static async findByNickname(nickname) {
    try {
      const query = 'SELECT * FROM business_staff WHERE nickname = ?';
      const result = await executeQuery(query, [nickname]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 更新业务人员信息
  static async updateById(id, staffData) {
    try {
      const { staff_name, nickname, position, department, phone, email, contact_info, status } = staffData;
      
      // 检查业务人员姓名是否与其他记录重复
      const existingStaff = await this.findByName(staff_name);
      if (existingStaff && existingStaff.id !== parseInt(id)) {
        throw new Error('业务人员姓名已存在');
      }
      
      const beijingTime = getBeijingTime();
      const query = `
        UPDATE business_staff 
        SET staff_name = ?, nickname = ?, position = ?, department = ?, phone = ?, email = ?, 
            contact_info = ?, status = ?, updated_at = ?
        WHERE id = ?
      `;
      
      const params = [staff_name, nickname, position, department, phone, email, contact_info, status || 'active', beijingTime, id];
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

  // 获取所有业务人员（分页）
  static async findAll(page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'asc') {
    try {
      let query = 'SELECT * FROM business_staff';
      let countQuery = 'SELECT COUNT(*) as total FROM business_staff';
      const params = [];

      // 添加搜索条件
      if (search) {
        const searchCondition = ' WHERE staff_name LIKE ? OR nickname LIKE ? OR position LIKE ? OR department LIKE ? OR phone LIKE ? OR email LIKE ? OR contact_info LIKE ?';
        query += searchCondition;
        countQuery += searchCondition;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      // 添加排序
      const allowedSortFields = ['id', 'staff_name', 'nickname', 'position', 'created_at', 'updated_at'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortField} ${sortDirection}`;

      // 添加分页
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      // 执行查询
      const [dataResult, countResult] = await Promise.all([
        executeQuery(query, params),
        executeQuery(countQuery, search ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : [])
      ]);

      if (dataResult.success && countResult.success) {
        return {
          businessStaff: dataResult.data,
          total: countResult.data[0].total,
          page,
          limit
        };
      } else {
        throw new Error('查询业务人员列表失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 删除业务人员
  static async deleteById(id) {
    try {
      // 1. 先检查业务人员是否存在
      const staffResult = await executeQuery('SELECT staff_name FROM business_staff WHERE id = ?', [id]);
      if (!staffResult.success || staffResult.data.length === 0) {
        throw new Error('业务人员不存在');
      }
      
      const staffName = staffResult.data[0].staff_name;
      
      // 2. 检查业务人员是否被产品引用
      const productCheck = await executeQuery(
        'SELECT COUNT(*) as count FROM products WHERE salesperson = ?',
        [staffName]
      );

      if (productCheck.success && productCheck.data[0].count > 0) {
        throw new Error('该业务人员已被产品引用，无法删除');
      }

      // 3. 执行删除操作
      const query = 'DELETE FROM business_staff WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (!result.success) {
        throw new Error('删除业务人员失败：数据库操作错误');
      }
      
      // SQLite的删除结果中使用changes字段表示受影响的行数
      if (result.data.changes === 0) {
        throw new Error('删除业务人员失败：未找到要删除的记录');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 获取业务人员选项列表（用于下拉框）
  static async getOptions() {
    try {
      const query = 'SELECT id, staff_name, nickname FROM business_staff ORDER BY staff_name';
      const result = await executeQuery(query);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error('获取业务人员选项失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 根据职务获取业务人员
  static async findByPosition(position) {
    try {
      const query = 'SELECT * FROM business_staff WHERE position = ? ORDER BY staff_name';
      const result = await executeQuery(query, [position]);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error('查询业务人员失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 获取职务列表
  static async getPositions() {
    try {
      const query = 'SELECT DISTINCT position FROM business_staff WHERE position IS NOT NULL ORDER BY position';
      const result = await executeQuery(query);
      
      if (result.success) {
        return result.data.map(item => item.position);
      } else {
        throw new Error('获取职务列表失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 获取业务人员统计信息
  static async getStats(staffId) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT p.id) as product_count
        FROM business_staff bs
        LEFT JOIN products p ON p.salesperson = bs.staff_name
        WHERE bs.id = ?
      `;
      
      const result = await executeQuery(query, [staffId]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      } else {
        throw new Error('获取业务人员统计信息失败');
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BusinessStaffModel;