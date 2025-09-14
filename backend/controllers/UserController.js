// 用户管理控制器
const UserModel = require('../models/User');
const { successResponse, errorResponse, paginatedResponse, calculatePagination } = require('../utils/response');
const { parsePaginationParams } = require('../utils/response');

class UserController {
  // 创建用户
  static async create(req, res) {
    try {
      console.log('创建用户请求数据:', req.body);
      const userData = req.body;
      const user = await UserModel.create(userData);
      
      res.status(201).json(successResponse('用户创建成功', user));
    } catch (error) {
      console.error('创建用户错误:', error);
      
      if (error.message === '用户名已存在') {
        return res.status(409).json(errorResponse(error.message, 'USERNAME_EXISTS'));
      }
      
      res.status(500).json(errorResponse('创建用户失败', 'CREATE_USER_FAILED'));
    }
  }

  // 获取用户列表
  static async getList(req, res) {
    try {
      const { page, limit } = parsePaginationParams(req);
      const search = req.query.search || '';

      const result = await UserModel.findAll(page, limit, search);
      const pagination = calculatePagination(result.total, page, limit);

      res.json(paginatedResponse('获取用户列表成功', result.users, pagination));
    } catch (error) {
      console.error('获取用户列表错误:', error);
      res.status(500).json(errorResponse('获取用户列表失败', 'GET_USERS_FAILED'));
    }
  }

  // 获取用户详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      
      if (!user) {
        return res.status(404).json(errorResponse('用户不存在', 'USER_NOT_FOUND'));
      }

      res.json(successResponse('获取用户详情成功', user));
    } catch (error) {
      console.error('获取用户详情错误:', error);
      res.status(500).json(errorResponse('获取用户详情失败', 'GET_USER_FAILED'));
    }
  }

  // 更新用户
  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;

      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json(errorResponse('用户不存在', 'USER_NOT_FOUND'));
      }

      const updatedUser = await UserModel.updateById(id, userData);
      res.json(successResponse('用户更新成功', updatedUser));
    } catch (error) {
      console.error('更新用户错误:', error);
      res.status(500).json(errorResponse('更新用户失败', 'UPDATE_USER_FAILED'));
    }
  }

  // 删除用户
  static async deleteById(req, res) {
    try {
      const { id } = req.params;

      // 执行删除操作（Model中已包含存在性检查）
      await UserModel.deleteById(id);
      res.json(successResponse('用户删除成功'));
    } catch (error) {
      console.error('删除用户错误:', error);
      
      if (error.message.includes('未找到要删除的记录')) {
        return res.status(404).json(errorResponse('用户不存在', 'USER_NOT_FOUND'));
      }
      
      res.status(500).json(errorResponse('删除用户失败', 'DELETE_USER_FAILED'));
    }
  }

  // 重置用户密码（管理员功能）
  static async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json(errorResponse('用户不存在', 'USER_NOT_FOUND'));
      }

      const success = await UserModel.updatePassword(id, newPassword);
      if (success) {
        res.json(successResponse('密码重置成功'));
      } else {
        res.status(500).json(errorResponse('密码重置失败', 'RESET_PASSWORD_FAILED'));
      }
    } catch (error) {
      console.error('重置密码错误:', error);
      res.status(500).json(errorResponse('重置密码失败', 'RESET_PASSWORD_FAILED'));
    }
  }
}

module.exports = UserController;