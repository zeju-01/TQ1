// 库存管理控制器
const InventoryModel = require('../models/Inventory');
const ProductModel = require('../models/Product');
const { successResponse, errorResponse, paginatedResponse, calculatePagination } = require('../utils/response');
const { parsePaginationParams } = require('../utils/response');
const { logRequest } = require('../utils/debugLogger');

class InventoryController {
  // 入库操作
  static async stockIn(req, res) {
    try {
      logRequest('原始请求数据', req.body);
      console.log('请求头信息:', req.headers);
      console.log('用户信息:', req.user);
      
      // 检查是否有验证错误
      const { validationResult } = require('express-validator');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('验证错误:', errors.array());
        return res.status(400).json({
          success: false,
          message: '验证失败: ' + errors.array().map(e => e.msg).join(', '),
          errors: errors.array()
        });
      }
      
      // 过滤掉已废弃的字段，但保留有用的字段（包括 stock_in_document）
      const { stock_in_auto_number, receipt_documents, ...filteredBody } = req.body;
      
      const stockInData = {
        ...filteredBody,
        stock_in_by: req.user ? req.user.username : 'unknown'
      };
      
      console.log('过滤后的数据:', stockInData);
      console.log('stock_in_document 字段值:', stockInData.stock_in_document);

      // 如果提供了产品ID，获取产品信息（但保留已有的product_name）
      if (stockInData.product_id) {
        const product = await ProductModel.findById(stockInData.product_id);
        if (product) {
          // 只有当product_name为空时才使用产品表中的名称
          if (!stockInData.product_name) {
            stockInData.product_name = product.name;
          }
          // 只有当product_model为空时才使用产品表中的型号
          if (!stockInData.product_model) {
            stockInData.product_model = product.model;
          }
          // 只有当product_description为空时才使用产品表中的描述
          if (!stockInData.product_description) {
            stockInData.product_description = product.description;
          }
          // 只有当operator为空时才使用产品表中的运营商
          if (!stockInData.operator) {
            stockInData.operator = product.operator;
          }
        }
      }

      const result = await InventoryModel.createStockIn(stockInData);
      res.status(201).json(successResponse('入库成功', result));
    } catch (error) {
      console.error('入库错误:', error);
      
      if (error.message === 'IMEI号已存在') {
        return res.status(409).json(errorResponse(error.message, 'IMEI_EXISTS'));
      }
      
      res.status(500).json(errorResponse('入库失败', 'STOCK_IN_FAILED'));
    }
  }

  // 批量入库
  static async batchStockIn(req, res) {
    try {
      const { stockInList } = req.body;
      
      if (!Array.isArray(stockInList) || stockInList.length === 0) {
        return res.status(400).json(errorResponse('入库列表不能为空', 'EMPTY_STOCK_IN_LIST'));
      }

      logRequest('批量入库原始数据', stockInList);
      
      // 为每个记录添加操作用户，并过滤掉已废弃的字段，但保留有用的字段（包括 stock_in_document）
      const processedList = stockInList.map(item => {
        const { stock_in_auto_number, receipt_documents, ...filteredItem } = item;
        return {
          ...filteredItem,
          stock_in_document: item.stock_in_document, // 显式保留 stock_in_document 字段
          stock_in_by: req.user.username
        };
      });
      
      logRequest('批量入库处理后数据', processedList);

      const result = await InventoryModel.batchStockIn(processedList);
      
      res.json(successResponse('批量入库完成', {
        total: stockInList.length,
        success: result.success,
        failed: result.failed,
        results: result.results,
        errors: result.errors
      }));
    } catch (error) {
      console.error('批量入库错误:', error);
      res.status(500).json(errorResponse('批量入库失败', 'BATCH_STOCK_IN_FAILED'));
    }
  }

  // 出库操作
  static async stockOut(req, res) {
    try {
      const { imei } = req.body;
      const stockOutData = {
        ...req.body,
        stock_out_by: req.user.id
      };

      const result = await InventoryModel.stockOut(imei, stockOutData);
      res.json(successResponse('出库成功', result));
    } catch (error) {
      console.error('出库错误:', error);
      
      if (error.message.includes('不存在') || error.message.includes('已出库') || error.message.includes('已退库')) {
        return res.status(400).json(errorResponse(error.message, 'STOCK_OUT_INVALID'));
      }
      
      res.status(500).json(errorResponse('出库失败', 'STOCK_OUT_FAILED'));
    }
  }

  // 退库操作
  static async returnStock(req, res) {
    try {
      const { imei } = req.body;
      const returnData = {
        ...req.body,
        returned_by: req.user.id
      };

      const result = await InventoryModel.returnStock(imei, returnData);
      res.json(successResponse('退库成功', result));
    } catch (error) {
      console.error('退库错误:', error);
      
      if (error.message.includes('不存在') || error.message.includes('已退库')) {
        return res.status(400).json(errorResponse(error.message, 'RETURN_INVALID'));
      }
      
      res.status(500).json(errorResponse('退库失败', 'RETURN_FAILED'));
    }
  }

  // 获取库存列表
  static async getList(req, res) {
    try {
      const { page, limit } = parsePaginationParams(req);
      const filters = {
        search: req.query.search,
        product_id: req.query.product_id,
        operator: req.query.operator,
        supplier: req.query.supplier,
        stock_in_status: req.query.stock_in_status,
        stock_out_status: req.query.stock_out_status,
        transaction_type: req.query.transaction_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await InventoryModel.findAll(page, limit, filters);
      const pagination = calculatePagination(result.total, page, limit);

      res.json(paginatedResponse('获取库存列表成功', result.inventory, pagination));
    } catch (error) {
      console.error('获取库存列表错误:', error);
      res.status(500).json(errorResponse('获取库存列表失败', 'GET_INVENTORY_FAILED'));
    }
  }

  // 获取库存详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const inventory = await InventoryModel.findById(id);
      
      if (!inventory) {
        return res.status(404).json(errorResponse('库存记录不存在', 'INVENTORY_NOT_FOUND'));
      }

      res.json(successResponse('获取库存详情成功', inventory));
    } catch (error) {
      console.error('获取库存详情错误:', error);
      res.status(500).json(errorResponse('获取库存详情失败', 'GET_INVENTORY_FAILED'));
    }
  }

  // 根据IMEI查询库存
  static async getByIMEI(req, res) {
    try {
      const { imei } = req.params;
      const inventory = await InventoryModel.findByIMEI(imei);
      
      if (!inventory) {
        return res.status(404).json(errorResponse('IMEI记录不存在', 'IMEI_NOT_FOUND'));
      }

      res.json(successResponse('获取IMEI库存成功', inventory));
    } catch (error) {
      console.error('根据IMEI获取库存错误:', error);
      res.status(500).json(errorResponse('获取IMEI库存失败', 'GET_INVENTORY_BY_IMEI_FAILED'));
    }
  }

  // 根据批次号查询库存
  static async getByBatch(req, res) {
    try {
      const { batch_number } = req.params;
      const inventory = await InventoryModel.findByBatchNumber(batch_number);

      res.json(successResponse('获取批次库存成功', inventory));
    } catch (error) {
      console.error('根据批次获取库存错误:', error);
      res.status(500).json(errorResponse('获取批次库存失败', 'GET_INVENTORY_BY_BATCH_FAILED'));
    }
  }

  // 获取库存统计
  static async getStats(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const stats = await InventoryModel.getStats(filters);
      res.json(successResponse('获取库存统计成功', stats));
    } catch (error) {
      console.error('获取库存统计错误:', error);
      res.status(500).json(errorResponse('获取库存统计失败', 'GET_STATS_FAILED'));
    }
  }

  // 更新库存信息
  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // 检查库存是否存在
      const existingInventory = await InventoryModel.findById(id);
      if (!existingInventory) {
        return res.status(404).json(errorResponse('库存记录不存在', 'INVENTORY_NOT_FOUND'));
      }

      const updatedInventory = await InventoryModel.updateById(id, updateData);
      res.json(successResponse('库存更新成功', updatedInventory));
    } catch (error) {
      console.error('更新库存错误:', error);
      res.status(500).json(errorResponse('更新库存失败', 'UPDATE_INVENTORY_FAILED'));
    }
  }

  // 检查IMEI是否可用
  static async checkIMEI(req, res) {
    try {
      const { imei } = req.params;
      const existing = await InventoryModel.findByIMEI(imei);
      
      res.json(successResponse('IMEI检查完成', {
        imei,
        available: !existing,
        existing: existing ? {
          id: existing.id,
          product_name: existing.product_name,
          stock_in_status: existing.stock_in_status,
          stock_out_status: existing.stock_out_status
        } : null
      }));
    } catch (error) {
      console.error('检查IMEI错误:', error);
      res.status(500).json(errorResponse('检查IMEI失败', 'CHECK_IMEI_FAILED'));
    }
  }
  
  // 获取最大的入库单号
  static async getMaxStockInNumber(req, res) {
    try {
      const maxStockInNumber = await InventoryModel.getMaxStockInNumber();
      res.json(successResponse('获取最大入库单号成功', { maxStockInNumber }));
    } catch (error) {
      console.error('获取最大入库单号错误:', error);
      res.status(500).json(errorResponse('获取最大入库单号失败', 'GET_MAX_STOCK_IN_NUMBER_FAILED'));
    }
  }
  
  // 根据条件搜索入库单号
  static async searchStockInNumbers(req, res) {
    try {
      const { filterType, searchValue } = req.query;
      
      if (!filterType) {
        return res.status(400).json(errorResponse('筛选条件不能为空', 'INVALID_SEARCH_PARAMS'));
      }
      
      // searchValue 可以为空字符串，表示搜索空值的情况
      const stockInNumbers = await InventoryModel.searchStockInNumbers(filterType, searchValue || '');
      res.json(successResponse('搜索入库单号成功', { stockInNumbers }));
    } catch (error) {
      console.error('搜索入库单号错误:', error);
      res.status(500).json(errorResponse('搜索入库单号失败', 'SEARCH_STOCK_IN_NUMBERS_FAILED'));
    }
  }
  
  // 根据入库单号获取入库记录
  static async getStockInRecordsByNumber(req, res) {
    try {
      const { stockInNumber } = req.query;
      
      if (!stockInNumber) {
        return res.status(400).json(errorResponse('入库单号不能为空', 'MISSING_STOCK_IN_NUMBER'));
      }
      
      const records = await InventoryModel.getStockInRecordsByNumber(stockInNumber);
      res.json(successResponse('获取入库记录成功', { records }));
    } catch (error) {
      console.error('获取入库记录错误:', error);
      res.status(500).json(errorResponse('获取入库记录失败', 'GET_STOCK_IN_RECORDS_FAILED'));
    }
  }
  
  // 批量更新库存记录
  static async batchUpdate(req, res) {
    try {
      const updates = req.body;
      
      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json(errorResponse('更新数据不能为空', 'EMPTY_UPDATES'));
      }
      
      // 验证每个更新项
      for (const update of updates) {
        if (!update.id || !update.data) {
          return res.status(400).json(errorResponse('每个更新项必须包含id和data字段', 'INVALID_UPDATE_FORMAT'));
        }
      }
      
      // 执行批量更新
      const results = [];
      const errors = [];
      
      for (const update of updates) {
        try {
          // 获取当前记录以确保我们有最新的数据
          const currentRecord = await InventoryModel.findById(update.id);
          if (!currentRecord) {
            errors.push({
              id: update.id,
              error: '记录不存在'
            });
            continue;
          }
          
          // 执行更新，自动设置updated_at为当前北京时间
          const updatedRecord = await InventoryModel.updateById(update.id, update.data);
          results.push({
            id: update.id,
            success: true,
            data: updatedRecord
          });
        } catch (error) {
          errors.push({
            id: update.id,
            error: error.message
          });
        }
      }
      
      res.json(successResponse('批量更新完成', {
        total: updates.length,
        success: results.length,
        failed: errors.length,
        results,
        errors
      }));
    } catch (error) {
      console.error('批量更新错误:', error);
      res.status(500).json(errorResponse('批量更新失败', 'BATCH_UPDATE_FAILED'));
    }
  }
  
  // 批量恢复库存记录
  static async batchRestore(req, res) {
    try {
      const restores = req.body;
      
      if (!Array.isArray(restores) || restores.length === 0) {
        return res.status(400).json(errorResponse('恢复数据不能为空', 'EMPTY_RESTORES'));
      }
      
      // 验证每个恢复项
      for (const restore of restores) {
        if (!restore.id || !restore.data) {
          return res.status(400).json(errorResponse('每个恢复项必须包含id和data字段', 'INVALID_RESTORE_FORMAT'));
        }
      }
      
      // 执行批量恢复
      const results = [];
      const errors = [];
      
      for (const restore of restores) {
        try {
          // 获取当前记录以确保我们有最新的数据
          const currentRecord = await InventoryModel.findById(restore.id);
          if (!currentRecord) {
            errors.push({
              id: restore.id,
              error: '记录不存在'
            });
            continue;
          }
          
          // 执行恢复，自动设置updated_at为当前北京时间
          const restoredRecord = await InventoryModel.updateById(restore.id, restore.data);
          results.push({
            id: restore.id,
            success: true,
            data: restoredRecord
          });
        } catch (error) {
          errors.push({
            id: restore.id,
            error: error.message
          });
        }
      }
      
      res.json(successResponse('批量恢复完成', {
        total: restores.length,
        success: results.length,
        failed: errors.length,
        results,
        errors
      }));
    } catch (error) {
      console.error('批量恢复错误:', error);
      res.status(500).json(errorResponse('批量恢复失败', 'BATCH_RESTORE_FAILED'));
    }
  }
}

module.exports = InventoryController;