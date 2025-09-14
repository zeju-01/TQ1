// 用户认证中间件
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const UserModel = require('../models/User');
const { errorResponse } = require('../utils/response');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json(errorResponse('访问令牌缺失', 'MISSING_TOKEN'));
    }

    // 验证令牌
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'access') {
      return res.status(401).json(errorResponse('无效的令牌类型', 'INVALID_TOKEN_TYPE'));
    }

    // 获取用户信息
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json(errorResponse('用户不存在', 'USER_NOT_FOUND'));
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.tokenPayload = decoded;
    
    next();
  } catch (error) {
    console.error('令牌验证错误:', error);
    return res.status(401).json(errorResponse(error.message, 'TOKEN_VERIFICATION_FAILED'));
  }
};

// 可选认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded.type === 'access') {
        const user = await UserModel.findById(decoded.id);
        if (user) {
          req.user = user;
          req.tokenPayload = decoded;
        }
      }
    }
    
    next();
  } catch (error) {
    // 静默处理错误，继续执行
    next();
  }
};

// 权限检查中间件
const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('用户未登录', 'UNAUTHORIZED'));
    }

    if (!UserModel.hasPermission(req.user, requiredPermission)) {
      return res.status(403).json(errorResponse('权限不足', 'INSUFFICIENT_PERMISSION'));
    }

    next();
  };
};

// 角色检查中间件
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('用户未登录', 'UNAUTHORIZED'));
    }

    if (!UserModel.hasRole(req.user, requiredRoles)) {
      return res.status(403).json(errorResponse('角色权限不足', 'INSUFFICIENT_ROLE'));
    }

    next();
  };
};

// 超级管理员权限检查
const requireSuperAdmin = requireRole('admin');

// 管理员权限检查（超级管理员或仓库管理员）
const requireAdmin = requireRole(['admin', 'manager']);

// 操作员权限检查（管理员或操作员）
const requireOperator = requireRole(['admin', 'manager', 'operator']);

// 组合中间件：认证 + 权限检查
const authAndPermission = (permission) => {
  return [authenticateToken, requirePermission(permission)];
};

// 组合中间件：认证 + 角色检查
const authAndRole = (roles) => {
  return [authenticateToken, requireRole(roles)];
};

// 刷新令牌验证中间件
const validateRefreshToken = (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json(errorResponse('刷新令牌缺失', 'MISSING_REFRESH_TOKEN'));
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json(errorResponse('无效的刷新令牌', 'INVALID_REFRESH_TOKEN'));
    }

    req.tokenPayload = decoded;
    next();
  } catch (error) {
    console.error('刷新令牌验证错误:', error);
    return res.status(401).json(errorResponse(error.message, 'REFRESH_TOKEN_VERIFICATION_FAILED'));
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requirePermission,
  requireRole,
  requireSuperAdmin,
  requireAdmin,
  requireOperator,
  authAndPermission,
  authAndRole,
  validateRefreshToken
};