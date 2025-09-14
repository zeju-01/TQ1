// 用户管理路由
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { validateUser, validateId, validatePagination, handleValidationErrors } = require('../utils/validation');
const { body } = require('express-validator');

// 获取所有用户
router.get('/', 
  authenticateToken,
  requireSuperAdmin,
  validatePagination,
  handleValidationErrors,
  UserController.getList
);

// 获取单个用户
router.get('/:id', 
  authenticateToken,
  requireSuperAdmin,
  validateId,
  handleValidationErrors,
  UserController.getById
);

// 创建用户
router.post('/', 
  authenticateToken,
  requireSuperAdmin,
  validateUser,
  handleValidationErrors,
  UserController.create
);

// 更新用户
router.put('/:id', 
  authenticateToken,
  requireSuperAdmin,
  validateId,
  validateUser,
  handleValidationErrors,
  UserController.updateById
);

// 重置用户密码（管理员功能）
router.post('/:id/reset-password',
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('新密码长度至少6位')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('新密码必须包含至少一个字母和一个数字'),
    body('confirmNewPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('两次输入的密码不一致');
        }
        return true;
      })
  ],
  authenticateToken,
  requireSuperAdmin,
  validateId,
  handleValidationErrors,
  UserController.resetPassword
);

// 删除用户
router.delete('/:id', 
  authenticateToken,
  requireSuperAdmin,
  validateId,
  handleValidationErrors,
  UserController.deleteById
);

module.exports = router;