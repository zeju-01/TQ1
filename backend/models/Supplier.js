// 供应商数据模型
const { executeQuery } = require('../config/database');

class SupplierModel {
  // 创建供应商
  static async create(supplierData) {
    try {
      const { company_name, contact_person, phone, email, address, contact_info, other_info } = supplierData;
      
      // 检查公司名称是否已存在
      const existingSupplier = await this.findByCompanyName(company_name);
      if (existingSupplier) {
        throw new Error('供应商公司名称已存在');
      }

      const query = `
        INSERT INTO suppliers (company_name, contact_person, phone, email, address, contact_info, other_info, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `;
      
      const params = [company_name, contact_person, phone, email, address, contact_info, other_info];
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

  // 根据ID查找供应商
  static async findById(id) {
    try {
      const query = 'SELECT * FROM suppliers WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据公司名称查找供应商
  static async findByCompanyName(company_name) {
    try {
      const query = 'SELECT * FROM suppliers WHERE company_name = ?';
      const result = await executeQuery(query, [company_name]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 更新供应商信息
  static async updateById(id, supplierData) {
    try {
      const { company_name, contact_person, phone, email, address, contact_info, other_info, status } = supplierData;
      
      // 检查公司名称是否与其他供应商重复
      const existingSupplier = await this.findByCompanyName(company_name);
      if (existingSupplier && existingSupplier.id !== parseInt(id)) {
        throw new Error('供应商公司名称已存在');
      }
      
      const query = `
        UPDATE suppliers 
        SET company_name = ?, contact_person = ?, phone = ?, email = ?, address = ?, 
            contact_info = ?, other_info = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const params = [company_name, contact_person, phone, email, address, contact_info, other_info, status || 'active', id];
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

  // 获取所有供应商（分页）
  static async findAll(page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'asc') {
    try {
      let query = 'SELECT * FROM suppliers';
      let countQuery = 'SELECT COUNT(*) as total FROM suppliers';
      const params = [];

      // 添加搜索条件
      if (search) {
        const searchCondition = ' WHERE company_name LIKE ? OR contact_person LIKE ? OR phone LIKE ? OR email LIKE ? OR address LIKE ? OR contact_info LIKE ? OR other_info LIKE ?';
        query += searchCondition;
        countQuery += searchCondition;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      // 添加排序
      const allowedSortFields = ['id', 'company_name', 'created_at', 'updated_at'];
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
          suppliers: dataResult.data,
          total: countResult.data[0].total,
          page,
          limit
        };
      } else {
        throw new Error('查询供应商列表失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 删除供应商
  static async deleteById(id) {
    try {
      // 1. 先检查供应商是否存在
      const supplierResult = await executeQuery('SELECT company_name FROM suppliers WHERE id = ?', [id]);
      if (!supplierResult.success || supplierResult.data.length === 0) {
        throw new Error('供应商不存在');
      }
      
      const supplierName = supplierResult.data[0].company_name;
      
      // 2. 检查供应商是否被产品或库存记录引用
      const [productCheck, inventoryCheck] = await Promise.all([
        executeQuery('SELECT COUNT(*) as count FROM products WHERE supplier = ?', [supplierName]),
        executeQuery('SELECT COUNT(*) as count FROM inventory WHERE supplier = ?', [supplierName])
      ]);

      if (productCheck.success && productCheck.data[0].count > 0) {
        throw new Error('该供应商已被产品引用，无法删除');
      }

      if (inventoryCheck.success && inventoryCheck.data[0].count > 0) {
        throw new Error('该供应商已有库存记录，无法删除');
      }

      // 3. 执行删除操作
      const query = 'DELETE FROM suppliers WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (!result.success) {
        throw new Error('删除供应商失败：数据库操作错误');
      }
      
      // SQLite的删除结果中使用changes字段表示受影响的行数
      if (result.data.changes === 0) {
        throw new Error('删除供应商失败：未找到要删除的记录');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 获取供应商选项列表（用于下拉框）
  static async getOptions() {
    try {
      // 修改查询语句，按公司名称去重
      const query = 'SELECT id, company_name FROM suppliers GROUP BY company_name ORDER BY company_name';
      const result = await executeQuery(query);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error('获取供应商选项失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 获取供应商统计信息
  static async getStats(supplierId) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT p.id) as product_count,
          COUNT(DISTINCT i.id) as inventory_count,
          SUM(CASE WHEN i.transaction_type = 'in' THEN 1 ELSE 0 END) as stock_in_count,
          SUM(CASE WHEN i.transaction_type = 'out' THEN 1 ELSE 0 END) as stock_out_count
        FROM suppliers s
        LEFT JOIN products p ON p.supplier = s.company_name
        LEFT JOIN inventory i ON i.supplier = s.company_name
        WHERE s.id = ?
      `;
      
      const result = await executeQuery(query, [supplierId]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      } else {
        throw new Error('获取供应商统计信息失败');
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SupplierModel;