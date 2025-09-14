// 运营商管理控制器
const OperatorModel = require('../models/Operator');
const { successResponse, errorResponse, paginatedResponse, calculatePagination } = require('../utils/response');
const { parsePaginationParams, parseSortParams } = require('../utils/response');

class OperatorController {
  // 创建运营商
  static async create(req, res) {
    try {
      const operatorData = req.body;
      const operator = await OperatorModel.create(operatorData);
      
      res.status(201).json(successResponse('运营商创建成功', operator));
    } catch (error) {
      console.error('创建运营商错误:', error);
      
      if (error.message.includes('已存在')) {
        return res.status(400).json(errorResponse(error.message, 'OPERATOR_NAME_EXISTS'));
      }
      
      res.status(500).json(errorResponse('创建运营商失败', 'CREATE_OPERATOR_FAILED'));
    }
  }

  // 获取运营商列表
  static async getList(req, res) {
    try {
      const { page, limit } = parsePaginationParams(req);
      const { field: sortBy, order: sortOrder } = parseSortParams(req, ['id', 'name', 'code', 'created_at', 'updated_at']);
      const search = req.query.search || '';

      const result = await OperatorModel.findAll(page, limit, search, sortBy, sortOrder);
      const pagination = calculatePagination(result.total, page, limit);

      res.json(paginatedResponse('获取运营商列表成功', result.operators, pagination));
    } catch (error) {
      console.error('获取运营商列表错误:', error);
      res.status(500).json(errorResponse('获取运营商列表失败', 'GET_OPERATORS_FAILED'));
    }
  }

  // 获取运营商详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const operator = await OperatorModel.findById(id);
      
      if (!operator) {
        return res.status(404).json(errorResponse('运营商不存在', 'OPERATOR_NOT_FOUND'));
      }

      res.json(successResponse('获取运营商详情成功', operator));
    } catch (error) {
      console.error('获取运营商详情错误:', error);
      res.status(500).json(errorResponse('获取运营商详情失败', 'GET_OPERATOR_FAILED'));
    }
  }

  // 更新运营商
  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const operatorData = req.body;

      // 检查运营商是否存在
      const existingOperator = await OperatorModel.findById(id);
      if (!existingOperator) {
        return res.status(404).json(errorResponse('运营商不存在', 'OPERATOR_NOT_FOUND'));
      }

      const updatedOperator = await OperatorModel.updateById(id, operatorData);
      res.json(successResponse('运营商更新成功', updatedOperator));
    } catch (error) {
      console.error('更新运营商错误:', error);
      
      if (error.message.includes('已存在')) {
        return res.status(400).json(errorResponse(error.message, 'OPERATOR_NAME_EXISTS'));
      }
      
      res.status(500).json(errorResponse('更新运营商失败', 'UPDATE_OPERATOR_FAILED'));
    }
  }

  // 删除运营商
  static async deleteById(req, res) {
    try {
      const { id } = req.params;

      // 执行删除操作（Model中已包含存在性检查和引用检查）
      await OperatorModel.deleteById(id);
      res.json(successResponse('运营商删除成功'));
    } catch (error) {
      console.error('删除运营商错误:', error);
      
      if (error.message.includes('不存在')) {
        return res.status(404).json(errorResponse(error.message, 'OPERATOR_NOT_FOUND'));
      }
      
      if (error.message.includes('引用') || error.message.includes('记录')) {
        return res.status(400).json(errorResponse(error.message, 'OPERATOR_IN_USE'));
      }
      
      res.status(500).json(errorResponse('删除运营商失败', 'DELETE_OPERATOR_FAILED'));
    }
  }

  // 获取运营商选项（用于下拉框）
  static async getOptions(req, res) {
    try {
      const options = await OperatorModel.getOptions();
      res.json(successResponse('获取运营商选项成功', options));
    } catch (error) {
      console.error('获取运营商选项错误:', error);
      res.status(500).json(errorResponse('获取运营商选项失败', 'GET_OPERATOR_OPTIONS_FAILED'));
    }
  }
}

module.exports = OperatorController;