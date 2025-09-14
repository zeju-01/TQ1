// 业务人员管理控制器
const BusinessStaffModel = require('../models/BusinessStaff');
const { successResponse, errorResponse, paginatedResponse, calculatePagination } = require('../utils/response');
const { parsePaginationParams, parseSortParams } = require('../utils/response');

class BusinessStaffController {
  // 创建业务人员
  static async create(req, res) {
    try {
      const staffData = req.body;
      const staff = await BusinessStaffModel.create(staffData);
      
      res.status(201).json(successResponse('业务人员创建成功', staff));
    } catch (error) {
      console.error('创建业务人员错误:', error);
      
      if (error.message === '业务人员姓名已存在') {
        return res.status(409).json(errorResponse(error.message, 'STAFF_EXISTS'));
      }
      
      res.status(500).json(errorResponse('创建业务人员失败', 'CREATE_STAFF_FAILED'));
    }
  }

  // 获取业务人员列表
  static async getList(req, res) {
    try {
      const { page, limit } = parsePaginationParams(req);
      const { field: sortBy, order: sortOrder } = parseSortParams(req, ['id', 'staff_name', 'nickname', 'position', 'created_at', 'updated_at']);
      const search = req.query.search || '';

      const result = await BusinessStaffModel.findAll(page, limit, search, sortBy, sortOrder);
      const pagination = calculatePagination(result.total, page, limit);

      res.json(paginatedResponse('获取业务人员列表成功', result.businessStaff, pagination));
    } catch (error) {
      console.error('获取业务人员列表错误:', error);
      res.status(500).json(errorResponse('获取业务人员列表失败', 'GET_STAFF_FAILED'));
    }
  }

  // 获取业务人员详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const staff = await BusinessStaffModel.findById(id);
      
      if (!staff) {
        return res.status(404).json(errorResponse('业务人员不存在', 'STAFF_NOT_FOUND'));
      }

      // 获取统计信息
      const stats = await BusinessStaffModel.getStats(id);
      
      res.json(successResponse('获取业务人员详情成功', { ...staff, stats }));
    } catch (error) {
      console.error('获取业务人员详情错误:', error);
      res.status(500).json(errorResponse('获取业务人员详情失败', 'GET_STAFF_FAILED'));
    }
  }

  // 更新业务人员
  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const staffData = req.body;

      // 检查业务人员是否存在
      const existingStaff = await BusinessStaffModel.findById(id);
      if (!existingStaff) {
        return res.status(404).json(errorResponse('业务人员不存在', 'STAFF_NOT_FOUND'));
      }

      const updatedStaff = await BusinessStaffModel.updateById(id, staffData);
      res.json(successResponse('业务人员更新成功', updatedStaff));
    } catch (error) {
      console.error('更新业务人员错误:', error);
      
      if (error.message === '业务人员姓名已存在') {
        return res.status(409).json(errorResponse(error.message, 'STAFF_EXISTS'));
      }
      
      res.status(500).json(errorResponse('更新业务人员失败', 'UPDATE_STAFF_FAILED'));
    }
  }

  // 删除业务人员
  static async deleteById(req, res) {
    try {
      const { id } = req.params;

      // 执行删除操作（Model中已包含存在性检查和引用检查）
      await BusinessStaffModel.deleteById(id);
      res.json(successResponse('业务人员删除成功'));
    } catch (error) {
      console.error('删除业务人员错误:', error);
      
      if (error.message.includes('不存在')) {
        return res.status(404).json(errorResponse(error.message, 'STAFF_NOT_FOUND'));
      }
      
      if (error.message.includes('引用')) {
        return res.status(400).json(errorResponse(error.message, 'STAFF_IN_USE'));
      }
      
      res.status(500).json(errorResponse('删除业务人员失败', 'DELETE_STAFF_FAILED'));
    }
  }

  // 获取业务人员选项（用于下拉框）
  static async getOptions(req, res) {
    try {
      const options = await BusinessStaffModel.getOptions();
      res.json(successResponse('获取业务人员选项成功', options));
    } catch (error) {
      console.error('获取业务人员选项错误:', error);
      res.status(500).json(errorResponse('获取业务人员选项失败', 'GET_STAFF_OPTIONS_FAILED'));
    }
  }

  // 根据职务获取业务人员
  static async getByPosition(req, res) {
    try {
      const { position } = req.params;
      const staff = await BusinessStaffModel.findByPosition(position);
      res.json(successResponse('获取职务业务人员成功', staff));
    } catch (error) {
      console.error('获取职务业务人员错误:', error);
      res.status(500).json(errorResponse('获取职务业务人员失败', 'GET_STAFF_BY_POSITION_FAILED'));
    }
  }

  // 获取职务列表
  static async getPositions(req, res) {
    try {
      const positions = await BusinessStaffModel.getPositions();
      res.json(successResponse('获取职务列表成功', positions));
    } catch (error) {
      console.error('获取职务列表错误:', error);
      res.status(500).json(errorResponse('获取职务列表失败', 'GET_POSITIONS_FAILED'));
    }
  }
}

module.exports = BusinessStaffController;