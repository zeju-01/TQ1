// 运营商数据模型
const { executeQuery } = require('../config/database');
const { getBeijingTime } = require('../utils/timeUtils');

class OperatorModel {
  // 创建运营商
  static async create(operatorData) {
    try {
      const { name, code, description, contact_person, phone, email, address } = operatorData;
      
      // 检查运营商名称是否已存在
      const existingOperator = await this.findByName(name);
      if (existingOperator) {
        throw new Error('运营商名称已存在');
      }

      const query = `
        INSERT INTO operators (name, code, description, contact_person, phone, email, address, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `;
      
      const params = [name, code, description, contact_person, phone, email, address];
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

  // 根据ID查找运营商
  static async findById(id) {
    try {
      const query = 'SELECT * FROM operators WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据名称查找运营商
  static async findByName(name) {
    try {
      const query = 'SELECT * FROM operators WHERE name = ?';
      const result = await executeQuery(query, [name]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 更新运营商信息
  static async updateById(id, operatorData) {
    try {
      const { name, code, description, contact_person, phone, email, address, status } = operatorData;
      
      // 检查运营商名称是否与其他运营商重复
      const existingOperator = await this.findByName(name);
      if (existingOperator && existingOperator.id !== parseInt(id)) {
        throw new Error('运营商名称已存在');
      }
      
      const beijingTime = getBeijingTime();
      const query = `
        UPDATE operators 
        SET name = ?, code = ?, description = ?, contact_person = ?, phone = ?, 
            email = ?, address = ?, status = ?, updated_at = ?
        WHERE id = ?
      `;
      
      const params = [name, code, description, contact_person, phone, email, address, status || 'active', beijingTime, id];
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

  // 获取所有运营商（分页）
  static async findAll(page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'asc') {
    try {
      let query = 'SELECT * FROM operators';
      let countQuery = 'SELECT COUNT(*) as total FROM operators';
      const params = [];

      // 添加搜索条件
      if (search) {
        const searchCondition = ' WHERE name LIKE ? OR code LIKE ? OR contact_person LIKE ?';
        query += searchCondition;
        countQuery += searchCondition;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // 添加排序
      const allowedSortFields = ['id', 'name', 'code', 'created_at', 'updated_at'];
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
        executeQuery(countQuery, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])
      ]);

      if (dataResult.success && countResult.success) {
        return {
          operators: dataResult.data,
          total: countResult.data[0].total,
          page,
          limit
        };
      } else {
        throw new Error('查询运营商列表失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 删除运营商
  static async deleteById(id) {
    try {
      // 首先获取运营商名称
      const operatorResult = await executeQuery('SELECT name FROM operators WHERE id = ?', [id]);
      if (!operatorResult.success || operatorResult.data.length === 0) {
        throw new Error('运营商不存在');
      }
      
      const operatorName = operatorResult.data[0].name;
      
      // 检查运营商是否被产品或库存记录引用
      const [productCheck, inventoryCheck] = await Promise.all([
        executeQuery('SELECT COUNT(*) as count FROM products WHERE operator = ?', [operatorName]),
        executeQuery('SELECT COUNT(*) as count FROM inventory WHERE operator = ?', [operatorName])
      ]);

      if (productCheck.success && productCheck.data[0].count > 0) {
        throw new Error('该运营商已被产品引用，无法删除');
      }

      if (inventoryCheck.success && inventoryCheck.data[0].count > 0) {
        throw new Error('该运营商已有库存记录，无法删除');
      }

      const query = 'DELETE FROM operators WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (!result.success) {
        throw new Error('删除运营商失败：数据库操作错误');
      }
      
      // SQLite的删除结果中使用changes字段表示受影响的行数
      if (result.data.changes === 0) {
        throw new Error('删除运营商失败：未找到要删除的记录');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 获取运营商选项列表（用于下拉框）
  static async getOptions() {
    try {
      // 修改查询语句，按名称去重并只获取活跃状态的运营商
      const query = 'SELECT id, name, code FROM operators WHERE status = "active" GROUP BY name ORDER BY name';
      const result = await executeQuery(query);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error('获取运营商选项失败');
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OperatorModel;