// 供应商管理控制器
const SupplierModel = require('../models/Supplier');
const { successResponse, errorResponse, paginatedResponse, calculatePagination } = require('../utils/response');
const { parsePaginationParams, parseSortParams } = require('../utils/response');

class SupplierController {
  // 创建供应商
  static async create(req, res) {
    try {
      const supplierData = req.body;
      const supplier = await SupplierModel.create(supplierData);
      
      res.status(201).json(successResponse('供应商创建成功', supplier));
    } catch (error) {
      console.error('创建供应商错误:', error);
      
      if (error.message === '供应商公司名称已存在') {
        return res.status(409).json(errorResponse(error.message, 'SUPPLIER_EXISTS'));
      }
      
      res.status(500).json(errorResponse('创建供应商失败', 'CREATE_SUPPLIER_FAILED'));
    }
  }

  // 获取供应商列表
  static async getList(req, res) {
    try {
      const { page, limit } = parsePaginationParams(req);
      const { field: sortBy, order: sortOrder } = parseSortParams(req, ['id', 'company_name', 'created_at', 'updated_at']);
      const search = req.query.search || '';

      const result = await SupplierModel.findAll(page, limit, search, sortBy, sortOrder);
      const pagination = calculatePagination(result.total, page, limit);

      res.json(paginatedResponse('获取供应商列表成功', result.suppliers, pagination));
    } catch (error) {
      console.error('获取供应商列表错误:', error);
      res.status(500).json(errorResponse('获取供应商列表失败', 'GET_SUPPLIERS_FAILED'));
    }
  }

  // 获取供应商详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const supplier = await SupplierModel.findById(id);
      
      if (!supplier) {
        return res.status(404).json(errorResponse('供应商不存在', 'SUPPLIER_NOT_FOUND'));
      }

      // 获取统计信息
      const stats = await SupplierModel.getStats(id);
      
      res.json(successResponse('获取供应商详情成功', { ...supplier, stats }));
    } catch (error) {
      console.error('获取供应商详情错误:', error);
      res.status(500).json(errorResponse('获取供应商详情失败', 'GET_SUPPLIER_FAILED'));
    }
  }

  // 更新供应商
  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const supplierData = req.body;

      // 检查供应商是否存在
      const existingSupplier = await SupplierModel.findById(id);
      if (!existingSupplier) {
        return res.status(404).json(errorResponse('供应商不存在', 'SUPPLIER_NOT_FOUND'));
      }

      const updatedSupplier = await SupplierModel.updateById(id, supplierData);
      res.json(successResponse('供应商更新成功', updatedSupplier));
    } catch (error) {
      console.error('更新供应商错误:', error);
      
      if (error.message === '供应商公司名称已存在') {
        return res.status(409).json(errorResponse(error.message, 'SUPPLIER_EXISTS'));
      }
      
      res.status(500).json(errorResponse('更新供应商失败', 'UPDATE_SUPPLIER_FAILED'));
    }
  }

  // 删除供应商
  static async deleteById(req, res) {
    try {
      const { id } = req.params;

      // 执行删除操作（Model中已包含存在性检查和引用检查）
      await SupplierModel.deleteById(id);
      res.json(successResponse('供应商删除成功'));
    } catch (error) {
      console.error('删除供应商错误:', error);
      
      if (error.message.includes('不存在')) {
        return res.status(404).json(errorResponse(error.message, 'SUPPLIER_NOT_FOUND'));
      }
      
      if (error.message.includes('引用') || error.message.includes('记录')) {
        return res.status(400).json(errorResponse(error.message, 'SUPPLIER_IN_USE'));
      }
      
      res.status(500).json(errorResponse('删除供应商失败', 'DELETE_SUPPLIER_FAILED'));
    }
  }

  // 获取供应商选项（用于下拉框）
  static async getOptions(req, res) {
    try {
      const options = await SupplierModel.getOptions();
      res.json(successResponse('获取供应商选项成功', options));
    } catch (error) {
      console.error('获取供应商选项错误:', error);
      res.status(500).json(errorResponse('获取供应商选项失败', 'GET_SUPPLIER_OPTIONS_FAILED'));
    }
  }
}

module.exports = SupplierController;