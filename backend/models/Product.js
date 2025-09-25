// 产品数据模型
const { executeQuery } = require('../config/database');
const { getBeijingTime } = require('../utils/timeUtils');

class ProductModel {
  // 创建产品
  static async create(productData) {
    try {
      const { name, model, description, abbreviation } = productData;
      
      const query = `
        INSERT INTO products (name, model, description, abbreviation)
        VALUES (?, ?, ?, ?)
      `;
      
      const params = [name, model, description, abbreviation];
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

  // 根据ID查找产品
  static async findById(id) {
    try {
      const query = 'SELECT * FROM products WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据产品名称查找产品
  static async findByName(name) {
    try {
      const query = 'SELECT * FROM products WHERE name = ?';
      const result = await executeQuery(query, [name]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据产品型号查找产品
  static async findByModel(model) {
    try {
      const query = 'SELECT * FROM products WHERE model = ?';
      const result = await executeQuery(query, [model]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 更新产品信息
  static async updateById(id, productData) {
    try {
      const { name, model, description, abbreviation } = productData;
      
      const beijingTime = getBeijingTime();
      const query = `
        UPDATE products 
        SET name = ?, model = ?, description = ?, abbreviation = ?, updated_at = ?
        WHERE id = ?
      `;
      
      const params = [name, model, description, abbreviation, beijingTime, id];
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

  // 获取所有产品（分页）
  static async findAll(page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'asc') {
    try {
      // 确保limit和page是有效数字
      const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
      const validPage = Math.max(1, parseInt(page) || 1);
      
      let query = 'SELECT * FROM products';
      let countQuery = 'SELECT COUNT(*) as total FROM products';
      const params = [];
      const countParams = [];

      // 添加搜索条件
      if (search) {
        const searchCondition = ' WHERE name LIKE ? OR model LIKE ? OR description LIKE ?';
        query += searchCondition;
        countQuery += searchCondition;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // 添加排序
      const allowedSortFields = ['id', 'name', 'model', 'created_at', 'updated_at'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortField} ${sortDirection}`;

      // 添加分页
      const offset = (validPage - 1) * validLimit;
      query += ' LIMIT ? OFFSET ?';
      params.push(validLimit, offset);

      // 执行查询
      const countResult = await executeQuery(countQuery, countParams);
      const dataResult = await executeQuery(query, params);

      if (dataResult.success && countResult.success) {
        return {
          products: dataResult.data,
          total: countResult.data[0].total,
          page: validPage,
          limit: validLimit
        };
      } else {
        throw new Error('查询产品列表失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 删除产品
  static async deleteById(id) {
    try {
      // 1. 先检查产品是否存在
      const productResult = await executeQuery('SELECT id FROM products WHERE id = ?', [id]);
      if (!productResult.success || productResult.data.length === 0) {
        throw new Error('产品不存在');
      }
      
      // 2. 检查产品是否被库存记录引用
      const inventoryCheck = await executeQuery(
        'SELECT COUNT(*) as count FROM inventory WHERE product_id = ?',
        [id]
      );

      if (inventoryCheck.success && inventoryCheck.data[0].count > 0) {
        throw new Error('该产品已有库存记录，无法删除');
      }

      // 3. 执行删除操作
      const query = 'DELETE FROM products WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (!result.success) {
        throw new Error('删除产品失败：数据库操作错误');
      }
      
      // SQLite的删除结果中使用changes字段表示受影响的行数
      if (result.data.changes === 0) {
        throw new Error('删除产品失败：未找到要删除的记录');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 获取产品选项列表（用于下拉框）
  static async getOptions() {
    try {
      const query = 'SELECT id, name, model, abbreviation FROM products ORDER BY name';
      const result = await executeQuery(query);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error('获取产品选项失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 根据运营商获取产品
  static async findByOperator(operator) {
    try {
      // 注意：这个方法现在可能不再需要，因为我们已经移除了operator字段
      // 但为了保持向后兼容性，我们返回空数组
      return [];
    } catch (error) {
      throw error;
    }
  }

  // 获取所有运营商列表
  static async getOperators() {
    try {
      // 注意：这个方法现在可能不再需要，因为我们已经移除了operator字段
      // 但为了保持向后兼容性，我们返回空数组
      return [];
    } catch (error) {
      throw error;
    }
  }

  // 获取所有供应商列表（从产品表）
  static async getSuppliers() {
    try {
      // 注意：这个方法现在可能不再需要，因为我们已经移除了supplier字段
      // 但为了保持向后兼容性，我们返回空数组
      return [];
    } catch (error) {
      throw error;
    }
  }

  // 获取所有快递公司列表
  static async getCouriers() {
    try {
      // 注意：这个方法现在可能不再需要，因为我们已经移除了courier_company字段
      // 但为了保持向后兼容性，我们返回空数组
      return [];
    } catch (error) {
      throw error;
    }
  }

}

module.exports = ProductModel;