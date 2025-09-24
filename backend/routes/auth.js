// 用户认证路由
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateToken, validateRefreshToken } = require('../middleware/auth');
const { validateLogin, validateUser, handleValidationErrors } = require('../utils/validation');
const { body } = require('express-validator');

// 用户登录
router.post('/login', 
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

// 用户注册（需要管理员权限）
router.post('/register', 
  validateUser,
  handleValidationErrors,
  AuthController.register
);

// 刷新令牌
router.post('/refresh', 
  validateRefreshToken,
  AuthController.refreshToken
);

// 用户登出
router.post('/logout', 
  authenticateToken,
  AuthController.logout
);

// 获取当前用户信息
router.get('/me', 
  authenticateToken,
  AuthController.getCurrentUser
);

// 修改密码
router.post('/change-password',
  [
    body('currentPassword').notEmpty().withMessage('当前密码不能为空'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('新密码长度至少6位')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('新密码必须包含至少一个字母和一个数字')
  ],
  handleValidationErrors,
  authenticateToken,
  AuthController.changePassword
);

// 验证令牌
router.get('/verify',
  authenticateToken,
  AuthController.verifyToken
);

module.exports = router;