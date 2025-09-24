// 快递公司数据模型
const { executeQuery } = require('../config/database');

class CourierModel {
  // 创建快递公司
  static async create(courierData) {
    try {
      const { name, code, description, contact_person, phone, email, address, tracking_url } = courierData;
      
      // 检查快递公司名称是否已存在
      const existingCourier = await this.findByName(name);
      if (existingCourier) {
        throw new Error('快递公司名称已存在');
      }

      const query = `
        INSERT INTO couriers (name, code, description, contact_person, phone, email, address, tracking_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `;
      
      const params = [name, code, description, contact_person, phone, email, address, tracking_url];
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

  // 根据ID查找快递公司
  static async findById(id) {
    try {
      const query = 'SELECT * FROM couriers WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据名称查找快递公司
  static async findByName(name) {
    try {
      const query = 'SELECT * FROM couriers WHERE name = ?';
      const result = await executeQuery(query, [name]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 更新快递公司信息
  static async updateById(id, courierData) {
    try {
      const { name, code, description, contact_person, phone, email, address, tracking_url, status } = courierData;
      
      // 检查快递公司名称是否与其他快递公司重复
      const existingCourier = await this.findByName(name);
      if (existingCourier && existingCourier.id !== parseInt(id)) {
        throw new Error('快递公司名称已存在');
      }
      
      const query = `
        UPDATE couriers 
        SET name = ?, code = ?, description = ?, contact_person = ?, phone = ?, 
            email = ?, address = ?, tracking_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const params = [name, code, description, contact_person, phone, email, address, tracking_url, status || 'active', id];
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

  // 获取所有快递公司（分页）
  static async findAll(page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'asc') {
    try {
      let query = 'SELECT * FROM couriers';
      let countQuery = 'SELECT COUNT(*) as total FROM couriers';
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
          couriers: dataResult.data,
          total: countResult.data[0].total,
          page,
          limit
        };
      } else {
        throw new Error('查询快递公司列表失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 删除快递公司
  static async deleteById(id) {
    try {
      // 首先获取快递公司名称
      const courierResult = await executeQuery('SELECT name FROM couriers WHERE id = ?', [id]);
      if (!courierResult.success || courierResult.data.length === 0) {
        throw new Error('快递公司不存在');
      }
      
      const courierName = courierResult.data[0].name;
      
      // 检查快递公司是否被产品或库存记录引用
      const [productCheck, inventoryCheck] = await Promise.all([
        executeQuery('SELECT COUNT(*) as count FROM products WHERE courier_company = ?', [courierName]),
        executeQuery('SELECT COUNT(*) as count FROM inventory WHERE courier_company = ?', [courierName])
      ]);

      if (productCheck.success && productCheck.data[0].count > 0) {
        throw new Error('该快递公司已被产品引用，无法删除');
      }

      if (inventoryCheck.success && inventoryCheck.data[0].count > 0) {
        throw new Error('该快递公司已有库存记录，无法删除');
      }

      const query = 'DELETE FROM couriers WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (!result.success) {
        throw new Error('删除快递公司失败：数据库操作错误');
      }
      
      // SQLite的删除结果中使用changes字段表示受影响的行数
      if (result.data.changes === 0) {
        throw new Error('删除快递公司失败：未找到要删除的记录');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 获取快递公司选项列表（用于下拉框）
  static async getOptions() {
    try {
      const query = 'SELECT id, name, code, tracking_url FROM couriers WHERE status = "active" ORDER BY name';
      const result = await executeQuery(query);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error('获取快递公司选项失败');
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CourierModel;