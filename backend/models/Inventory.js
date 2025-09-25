// 库存数据模型
const { executeQuery, executeTransaction } = require('../config/database');
const { getBeijingTime, getBeijingDate, formatToDateString } = require('../utils/timeUtils');

class InventoryModel {
  // 创建入库记录
  static async createStockIn(stockInData) {
    try {
      const {
        product_id, product_name, product_model, product_description, operator,
        imei, batch_number, stock_in_quantity = 1, supplier, factory_name,
        factory_order, stock_in_date, stock_in_contract_number, stock_in_document,
        stock_in_by, stock_in_notes, stock_in_number  // 添加入库单号字段
      } = stockInData;

      // 检查IMEI是否已存在（仅当IMEI不为空时）
      if (imei && imei.trim() !== '') {
        const existingItem = await this.findByIMEI(imei);
        if (existingItem) {
          throw new Error('IMEI号已存在');
        }
      }

      // 处理入库日期，确保格式为 YYYY-MM-DD
      const formatted_stock_in_date = formatToDateString(stock_in_date);

      // 获取当前北京时间用于 stock_in_time 字段（保持完整时间格式）
      const beijingTime = getBeijingTime();
      console.log('当前北京时间:', beijingTime);
      
      // 验证时间处理是否正确
      const testTime = new Date();
      console.log('系统UTC时间:', testTime.toISOString());
      console.log('转换后北京时间:', beijingTime);

      // 注意：根据用户要求，以下字段在入库时不应填充数据：
      // return_time, after_sales_time, stock_out_date, stock_out_time, updated_at
      // 这些字段将保持为NULL，直到相应的操作发生时才填充

      const query = `
        INSERT INTO inventory (
          product_id, product_name, product_model, product_description, operator,
          imei, batch_number, stock_in_quantity, stock_in_status, return_status,
          after_sales_status, other_status, supplier,
          factory_name, factory_order, stock_in_date, stock_in_contract_number,
          stock_in_document, stock_in_by, stock_in_notes, quantity, transaction_type,
          stock_in_number, stock_in_auto_number, stock_in_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        product_id, product_name, product_model, product_description, operator,
        imei || null,  // 如果IMEI为空，插入NULL而不是空字符串
        batch_number, stock_in_quantity, '已入库', '正常',
        '正常', '正常', supplier,
        factory_name, factory_order, formatted_stock_in_date, stock_in_contract_number,
        stock_in_document, stock_in_by, stock_in_notes, stock_in_quantity, 'in',
        stock_in_number || null,
        // 添加 stock_in_auto_number 字段，显式设置为 NULL
        null,
        // 添加 stock_in_time 字段，使用当前北京时间（完整时间格式）
        beijingTime,
        // 添加created_at字段，使用当前时间（完整时间格式）
        beijingTime
      ];

      console.log('执行入库SQL:', query);
      console.log('SQL参数:', params);

      const result = await executeQuery(query, params);
      
      if (result.success) {
        return await this.findById(result.data.lastID || result.data.insertId);
      } else {
        throw new Error(result.error || '入库操作失败');
      }
    } catch (error) {
      console.error('入库操作异常:', error);
      throw error;
    }
  }

  // 批量入库
  static async batchStockIn(stockInList) {
    try {
      const results = [];
      const errors = [];

      for (let i = 0; i < stockInList.length; i++) {
        try {
          const result = await this.createStockIn(stockInList[i]);
          results.push(result);
        } catch (error) {
          errors.push({
            index: i,
            imei: stockInList[i].imei,
            error: error.message
          });
        }
      }

      return {
        success: results.length,
        failed: errors.length,
        results,
        errors
      };
    } catch (error) {
      throw error;
    }
  }

  // 出库操作
  static async stockOut(imei, stockOutData) {
    try {
      const {
        stock_out_quantity = 1, stock_out_contract_number, sales_order_number,
        recipient, delivery_info, courier_company, tracking_number,
        stock_out_by, stock_out_notes, customer
      } = stockOutData;

      // 检查库存是否存在且可出库
      const item = await this.findByIMEI(imei);
      if (!item) {
        throw new Error('库存记录不存在');
      }

      if (item.stock_out_status === '已出库') {
        throw new Error('该设备已出库');
      }

      if (item.return_status === '已退库') {
        throw new Error('该设备已退库，无法出库');
      }

      // 生成出库自动编号
      const dateStr = getBeijingDate().replace(/-/g, '');
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const stock_out_number = 'OUT' + dateStr + random;

      // 获取北京时间（完整时间格式）
      const beijingTime = getBeijingTime();
      console.log('出库北京时间:', beijingTime);
      
      // 处理出库日期，确保格式为 YYYY-MM-DD
      const stock_out_date = getBeijingDate();
      console.log('出库日期:', stock_out_date);
      
      // 验证时间处理是否正确
      const testTime = new Date();
      console.log('系统UTC时间:', testTime.toISOString());
      console.log('转换后北京时间:', beijingTime);
      
      const query = `
        UPDATE inventory SET
          stock_out_number = ?, stock_out_date = ?, stock_out_quantity = ?,
          stock_out_contract_number = ?, sales_order_number = ?, recipient = ?,
          delivery_info = ?, courier_company = ?, tracking_number = ?,
          stock_out_time = ?, stock_out_by = ?, stock_out_notes = ?,
          stock_out_status = '已出库', customer = ?, transaction_type = 'out',
          updated_at = ?
        WHERE imei = ?
      `;

      const params = [
        stock_out_number, stock_out_date, stock_out_quantity, stock_out_contract_number,
        sales_order_number, recipient, delivery_info, courier_company,
        tracking_number, beijingTime, stock_out_by, stock_out_notes, customer, beijingTime, imei
      ];

      const result = await executeQuery(query, params);
      
      if (result.success && result.data.affectedRows > 0) {
        return await this.findByIMEI(imei);
      } else {
        throw new Error('出库操作失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 退库操作
  static async returnStock(imei, returnData) {
    try {
      const {
        returned_by, return_reason, return_type, return_notes
      } = returnData;

      // 检查库存是否存在
      const item = await this.findByIMEI(imei);
      if (!item) {
        throw new Error('库存记录不存在');
      }

      if (item.return_status === '已退库') {
        throw new Error('该设备已退库');
      }

      // 获取北京时间
      const beijingTime = getBeijingTime();
      console.log('退库北京时间:', beijingTime);
      
      // 验证时间处理是否正确
      const testTime = new Date();
      console.log('系统UTC时间:', testTime.toISOString());
      console.log('转换后北京时间:', beijingTime);
      
      const query = `
        UPDATE inventory SET
          return_status = '已退库', return_time = ?,
          returned_by = ?, return_reason = ?, return_type = ?, return_notes = ?,
          transaction_type = 'return', updated_at = ?
        WHERE imei = ?
      `;

      const params = [beijingTime, returned_by, return_reason, return_type, return_notes, beijingTime, imei];
      const result = await executeQuery(query, params);
      
      if (result.success && result.data.affectedRows > 0) {
        return await this.findByIMEI(imei);
      } else {
        throw new Error('退库操作失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 根据ID查找库存
  static async findById(id) {
    try {
      const query = 'SELECT * FROM inventory WHERE id = ?';
      const result = await executeQuery(query, [id]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 根据IMEI查找库存
  static async findByIMEI(imei) {
    try {
      const query = 'SELECT * FROM inventory WHERE imei = ?';
      const result = await executeQuery(query, [imei]);
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
  
  // 更新库存信息
  static async updateById(id, updateData) {
    try {
      const setClause = [];
      const params = [];

      // 动态构建更新字段
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          setClause.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (setClause.length === 0) {
        throw new Error('没有要更新的字段');
      }

      // 获取北京时间
      const beijingTime = getBeijingTime();
      console.log('更新库存北京时间:', beijingTime);
      
      // 验证时间处理是否正确
      const testTime = new Date();
      console.log('系统UTC时间:', testTime.toISOString());
      console.log('转换后北京时间:', beijingTime);
      
      setClause.push('updated_at = ?');
      params.push(beijingTime, id);

      const query = `UPDATE inventory SET ${setClause.join(', ')} WHERE id = ?`;
      const result = await executeQuery(query, params);
      
      if (result.success && result.data.affectedRows > 0) {
        return await this.findById(id);
      } else {
        throw new Error('更新库存失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 获取最大的入库单号
  static async getMaxStockInNumber() {
    try {
      // 获取当天日期
      const today = getBeijingDate().replace(/-/g, '');
      
      // 查询当天最大的入库单号
      const query = `
        SELECT stock_in_number 
        FROM inventory 
        WHERE stock_in_number LIKE 'SI${today}%' 
        ORDER BY stock_in_number DESC 
        LIMIT 1
      `;
      
      const result = await executeQuery(query);
      
      if (result.success && result.data.length > 0) {
        const maxNumber = result.data[0].stock_in_number;
        // 提取序号部分并加1
        const prefix = `SI${today}`;
        const currentSeq = parseInt(maxNumber.replace(prefix, '')) || 0;
        const nextSeq = currentSeq + 1;
        const nextSeqStr = String(nextSeq).padStart(4, '0');
        return `${prefix}${nextSeqStr}`;
      } else {
        // 如果没有找到当天的入库单号，则从0001开始
        return `SI${today}0001`;
      }
    } catch (error) {
      console.error('获取最大入库单号错误:', error);
      throw error;
    }
  }
  
  // 获取库存列表（分页）
  static async findAll(page = 1, limit = 20, filters = {}) {
    try {
      let query = 'SELECT * FROM inventory';
      let countQuery = 'SELECT COUNT(*) as total FROM inventory';
      const params = [];
      const conditions = [];

      // 添加过滤条件
      if (filters.search) {
        conditions.push('(imei LIKE ? OR product_name LIKE ? OR product_model LIKE ? OR supplier LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.product_id) {
        conditions.push('product_id = ?');
        params.push(filters.product_id);
      }

      if (filters.operator) {
        conditions.push('operator = ?');
        params.push(filters.operator);
      }

      if (filters.supplier) {
        conditions.push('supplier = ?');
        params.push(filters.supplier);
      }

      if (filters.stock_in_status) {
        conditions.push('stock_in_status = ?');
        params.push(filters.stock_in_status);
      }

      if (filters.stock_out_status) {
        conditions.push('stock_out_status = ?');
        params.push(filters.stock_out_status);
      }

      if (filters.transaction_type) {
        conditions.push('transaction_type = ?');
        params.push(filters.transaction_type);
      }

      if (filters.start_date) {
        conditions.push('stock_in_date >= ?');
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        conditions.push('stock_in_date <= ?');
        params.push(filters.end_date + ' 23:59:59');
      }

      // 应用条件
      if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
      }

      // 添加排序
      const sortBy = filters.sortBy || 'id';
      const sortOrder = filters.sortOrder || 'desc';
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

      // 添加分页
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      // 执行查询
      const [dataResult, countResult] = await Promise.all([
        executeQuery(query, params),
        executeQuery(countQuery, params.slice(0, -2)) // 移除limit和offset参数
      ]);

      if (dataResult.success && countResult.success) {
        return {
          inventory: dataResult.data,
          total: countResult.data[0].total,
          page,
          limit
        };
      } else {
        throw new Error('查询库存列表失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 获取库存统计
  static async getStats(filters = {}) {
    try {
      let baseQuery = 'SELECT COUNT(*) as count FROM inventory';
      const conditions = [];
      const params = [];

      // 添加基础过滤条件
      if (filters.start_date) {
        conditions.push('stock_in_date >= ?');
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        conditions.push('stock_in_date <= ?');
        params.push(filters.end_date + ' 23:59:59');
      }

      const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

      const queries = [
        // 总库存
        `${baseQuery}${whereClause}`,
        // 入库数量
        `${baseQuery}${whereClause}${conditions.length > 0 ? ' AND' : ' WHERE'} transaction_type = 'in'`,
        // 出库数量
        `${baseQuery}${whereClause}${conditions.length > 0 ? ' AND' : ' WHERE'} transaction_type = 'out'`,
        // 在库数量
        `${baseQuery}${whereClause}${conditions.length > 0 ? ' AND' : ' WHERE'} stock_out_status IS NULL OR stock_out_status != '已出库'`,
        // 退库数量
        `${baseQuery}${whereClause}${conditions.length > 0 ? ' AND' : ' WHERE'} return_status = '已退库'`
      ];

      const results = await Promise.all(
        queries.map(query => executeQuery(query, params))
      );

      if (results.every(result => result.success)) {
        return {
          total: results[0].data[0].count,
          stockIn: results[1].data[0].count,
          stockOut: results[2].data[0].count,
          available: results[3].data[0].count,
          returned: results[4].data[0].count
        };
      } else {
        throw new Error('获取统计数据失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 根据批次号获取库存
  static async findByBatchNumber(batch_number) {
    try {
      const query = 'SELECT * FROM inventory WHERE batch_number = ? ORDER BY stock_in_date DESC';
      const result = await executeQuery(query, [batch_number]);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error('查询批次库存失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 根据条件搜索入库单号
  static async searchStockInNumbers(filterType, searchValue) {
    try {
      let query = '';
      let params = [];
      
      switch (filterType) {
        case 'contract_number':
          if (searchValue === '') {
            // 搜索空值的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE (stock_in_contract_number IS NULL OR stock_in_contract_number = "") AND stock_in_number IS NOT NULL AND stock_in_number != ""';
          } else {
            // 搜索包含指定内容的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE stock_in_contract_number LIKE ? AND stock_in_number IS NOT NULL AND stock_in_number != ""';
            params = [`%${searchValue}%`];
          }
          break;
        case 'supplier':
          if (searchValue === '') {
            // 搜索空值的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE (supplier IS NULL OR supplier = "") AND stock_in_number IS NOT NULL AND stock_in_number != ""';
          } else {
            // 搜索包含指定内容的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE supplier LIKE ? AND stock_in_number IS NOT NULL AND stock_in_number != ""';
            params = [`%${searchValue}%`];
          }
          break;
        case 'factory_order':
          if (searchValue === '') {
            // 搜索空值的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE (factory_order IS NULL OR factory_order = "") AND stock_in_number IS NOT NULL AND stock_in_number != ""';
          } else {
            // 搜索包含指定内容的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE factory_order LIKE ? AND stock_in_number IS NOT NULL AND stock_in_number != ""';
            params = [`%${searchValue}%`];
          }
          break;
        case 'box_number':
          if (searchValue === '') {
            // 搜索空值的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE (batch_number IS NULL OR batch_number = "") AND stock_in_number IS NOT NULL AND stock_in_number != ""';
          } else {
            // 搜索包含指定内容的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE batch_number LIKE ? AND stock_in_number IS NOT NULL AND stock_in_number != ""';
            params = [`%${searchValue}%`];
          }
          break;
        case 'receipt_documents':
          if (searchValue === '') {
            // 搜索空值的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE (stock_in_document IS NULL OR stock_in_document = "") AND stock_in_number IS NOT NULL AND stock_in_number != ""';
          } else {
            // 搜索包含指定内容的情况
            query = 'SELECT DISTINCT stock_in_number FROM inventory WHERE stock_in_document LIKE ? AND stock_in_number IS NOT NULL AND stock_in_number != ""';
            params = [`%${searchValue}%`];
          }
          break;
        default:
          throw new Error('无效的筛选条件');
      }
      
      const result = await executeQuery(query, params);
      
      if (result.success) {
        return result.data.map(item => item.stock_in_number);
      } else {
        throw new Error('搜索入库单号失败');
      }
    } catch (error) {
      throw error;
    }
  }
  
  // 根据入库单号获取入库记录
  static async getStockInRecordsByNumber(stockInNumber) {
    try {
      const query = 'SELECT * FROM inventory WHERE stock_in_number = ? ORDER BY id';
      const params = [stockInNumber];
      
      const result = await executeQuery(query, params);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error('获取入库记录失败');
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = InventoryModel;