// 用户认证控制器
const UserModel = require('../models/User');
const { generateTokenPair, verifyToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  // 用户登录
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log('登录请求:', { username, password });

      // 查找用户（包含密码）
      const user = await UserModel.findByUsernameWithPassword(username);
      console.log('查找用户结果:', user);
      if (!user) {
        console.log('用户不存在');
        return res.status(401).json(errorResponse('用户名或密码错误', 'INVALID_CREDENTIALS'));
      }

      // 验证密码
      const isPasswordValid = await UserModel.validatePassword(password, user.password);
      console.log('密码验证结果:', isPasswordValid);
      if (!isPasswordValid) {
        return res.status(401).json(errorResponse('用户名或密码错误', 'INVALID_CREDENTIALS'));
      }

      // 更新最后登录时间
      console.log('更新用户ID为', user.id, '的最后登录时间');
      await UserModel.updateLastLogin(user.id);

      // 重新获取用户信息（包含更新的last_login字段）
      const updatedUser = await UserModel.findById(user.id);
      console.log('更新后的用户信息:', updatedUser);

      // 生成令牌对
      const tokens = generateTokenPair(updatedUser);

      // 移除密码字段
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json(successResponse('登录成功', {
        user: userWithoutPassword,
        ...tokens
      }));
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json(errorResponse('登录失败，请稍后重试', 'LOGIN_FAILED'));
    }
  }

  // 用户注册
  static async register(req, res) {
    try {
      const userData = req.body;

      // 创建用户
      const user = await UserModel.create(userData);

      // 生成令牌对
      const tokens = generateTokenPair(user);

      res.status(201).json(successResponse('注册成功', {
        user,
        ...tokens
      }));
    } catch (error) {
      console.error('注册错误:', error);
      
      if (error.message === '用户名已存在') {
        return res.status(409).json(errorResponse(error.message, 'USERNAME_EXISTS'));
      }
      
      res.status(500).json(errorResponse('注册失败，请稍后重试', 'REGISTRATION_FAILED'));
    }
  }

  // 刷新令牌
  static async refreshToken(req, res) {
    try {
      const { id } = req.tokenPayload;

      // 获取用户信息
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(401).json(errorResponse('用户不存在', 'USER_NOT_FOUND'));
      }

      // 生成新的令牌对
      const tokens = generateTokenPair(user);

      res.json(successResponse('令牌刷新成功', {
        user,
        ...tokens
      }));
    } catch (error) {
      console.error('刷新令牌错误:', error);
      res.status(500).json(errorResponse('令牌刷新失败', 'TOKEN_REFRESH_FAILED'));
    }
  }

  // 用户登出
  static async logout(req, res) {
    try {
      // 在实际应用中，可以将令牌加入黑名单
      // 这里简单返回成功消息
      res.json(successResponse('登出成功'));
    } catch (error) {
      console.error('登出错误:', error);
      res.status(500).json(errorResponse('登出失败', 'LOGOUT_FAILED'));
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req, res) {
    try {
      const user = req.user;
      res.json(successResponse('获取用户信息成功', { user }));
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json(errorResponse('获取用户信息失败', 'GET_USER_FAILED'));
    }
  }

  // 修改当前用户密码
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // 获取用户完整信息（包含密码）
      const user = await UserModel.findByUsernameWithPassword(req.user.username);
      if (!user) {
        return res.status(404).json(errorResponse('用户不存在', 'USER_NOT_FOUND'));
      }

      // 验证当前密码
      const isCurrentPasswordValid = await UserModel.validatePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json(errorResponse('当前密码错误', 'INVALID_CURRENT_PASSWORD'));
      }

      // 更新密码
      const success = await UserModel.updatePassword(userId, newPassword);
      if (!success) {
        return res.status(500).json(errorResponse('密码更新失败', 'PASSWORD_UPDATE_FAILED'));
      }

      res.json(successResponse('密码修改成功'));
    } catch (error) {
      console.error('修改密码错误:', error);
      res.status(500).json(errorResponse('修改密码失败', 'CHANGE_PASSWORD_FAILED'));
    }
  }

  // 验证令牌有效性
  static async verifyToken(req, res) {
    try {
      // 如果能到达这里，说明令牌有效（已通过中间件验证）
      const user = req.user;
      const tokenPayload = req.tokenPayload;

      // 检查令牌是否即将过期
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = tokenPayload.exp - now;
      const isExpiringSoon = timeUntilExpiry < 30 * 60; // 30分钟

      res.json(successResponse('令牌验证成功', {
        user,
        isExpiringSoon,
        expiresIn: timeUntilExpiry
      }));
    } catch (error) {
      console.error('令牌验证错误:', error);
      res.status(500).json(errorResponse('令牌验证失败', 'TOKEN_VERIFICATION_FAILED'));
    }
  }
}

module.exports = AuthController;