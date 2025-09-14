// 快递公司管理控制器
const CourierModel = require('../models/Courier');
const { successResponse, errorResponse, paginatedResponse, calculatePagination } = require('../utils/response');
const { parsePaginationParams, parseSortParams } = require('../utils/response');

class CourierController {
  // 创建快递公司
  static async create(req, res) {
    try {
      const courierData = req.body;
      const courier = await CourierModel.create(courierData);
      
      res.status(201).json(successResponse('快递公司创建成功', courier));
    } catch (error) {
      console.error('创建快递公司错误:', error);
      
      if (error.message.includes('已存在')) {
        return res.status(400).json(errorResponse(error.message, 'COURIER_NAME_EXISTS'));
      }
      
      res.status(500).json(errorResponse('创建快递公司失败', 'CREATE_COURIER_FAILED'));
    }
  }

  // 获取快递公司列表
  static async getList(req, res) {
    try {
      const { page, limit } = parsePaginationParams(req);
      const { field: sortBy, order: sortOrder } = parseSortParams(req, ['id', 'name', 'code', 'created_at', 'updated_at']);
      const search = req.query.search || '';

      const result = await CourierModel.findAll(page, limit, search, sortBy, sortOrder);
      const pagination = calculatePagination(result.total, page, limit);

      res.json(paginatedResponse('获取快递公司列表成功', result.couriers, pagination));
    } catch (error) {
      console.error('获取快递公司列表错误:', error);
      res.status(500).json(errorResponse('获取快递公司列表失败', 'GET_COURIERS_FAILED'));
    }
  }

  // 获取快递公司详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const courier = await CourierModel.findById(id);
      
      if (!courier) {
        return res.status(404).json(errorResponse('快递公司不存在', 'COURIER_NOT_FOUND'));
      }

      res.json(successResponse('获取快递公司详情成功', courier));
    } catch (error) {
      console.error('获取快递公司详情错误:', error);
      res.status(500).json(errorResponse('获取快递公司详情失败', 'GET_COURIER_FAILED'));
    }
  }

  // 更新快递公司
  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const courierData = req.body;

      // 检查快递公司是否存在
      const existingCourier = await CourierModel.findById(id);
      if (!existingCourier) {
        return res.status(404).json(errorResponse('快递公司不存在', 'COURIER_NOT_FOUND'));
      }

      const updatedCourier = await CourierModel.updateById(id, courierData);
      res.json(successResponse('快递公司更新成功', updatedCourier));
    } catch (error) {
      console.error('更新快递公司错误:', error);
      
      if (error.message.includes('已存在')) {
        return res.status(400).json(errorResponse(error.message, 'COURIER_NAME_EXISTS'));
      }
      
      res.status(500).json(errorResponse('更新快递公司失败', 'UPDATE_COURIER_FAILED'));
    }
  }

  // 删除快递公司
  static async deleteById(req, res) {
    try {
      const { id } = req.params;

      // 执行删除操作（Model中已包含存在性检查和引用检查）
      await CourierModel.deleteById(id);
      res.json(successResponse('快递公司删除成功'));
    } catch (error) {
      console.error('删除快递公司错误:', error);
      
      if (error.message.includes('不存在')) {
        return res.status(404).json(errorResponse(error.message, 'COURIER_NOT_FOUND'));
      }
      
      if (error.message.includes('引用') || error.message.includes('记录')) {
        return res.status(400).json(errorResponse(error.message, 'COURIER_IN_USE'));
      }
      
      res.status(500).json(errorResponse('删除快递公司失败', 'DELETE_COURIER_FAILED'));
    }
  }

  // 获取快递公司选项（用于下拉框）
  static async getOptions(req, res) {
    try {
      const options = await CourierModel.getOptions();
      res.json(successResponse('获取快递公司选项成功', options));
    } catch (error) {
      console.error('获取快递公司选项错误:', error);
      res.status(500).json(errorResponse('获取快递公司选项失败', 'GET_COURIER_OPTIONS_FAILED'));
    }
  }
}

module.exports = CourierController;