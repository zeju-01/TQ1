// 运营商管理路由
const express = require('express');
const router = express.Router();
const OperatorController = require('../controllers/OperatorController');
const { authenticateToken, requireOperator } = require('../middleware/auth');
const { validateOperator, validateId, validatePagination, handleValidationErrors } = require('../utils/validation');

// 获取所有运营商
router.get('/', 
  validatePagination,
  handleValidationErrors,
  OperatorController.getList
);

// 获取运营商选项（用于下拉框）
router.get('/options', 
  OperatorController.getOptions
);

// 获取单个运营商
router.get('/:id', 
  validateId,
  handleValidationErrors,
  OperatorController.getById
);

// 创建运营商
router.post('/', 
  authenticateToken,
  requireOperator,
  validateOperator,
  handleValidationErrors,
  OperatorController.create
);

// 更新运营商
router.put('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  validateOperator,
  handleValidationErrors,
  OperatorController.updateById
);

// 删除运营商
router.delete('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  handleValidationErrors,
  OperatorController.deleteById
);

module.exports = router;