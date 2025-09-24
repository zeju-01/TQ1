// 供应商管理路由
const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/SupplierController');
const { authenticateToken, requireOperator } = require('../middleware/auth');
const { validateSupplier, validateId, validatePagination, handleValidationErrors } = require('../utils/validation');

// 获取所有供应商
router.get('/', 
  validatePagination,
  handleValidationErrors,
  SupplierController.getList
);

// 获取供应商选项（用于下拉框）
router.get('/options', 
  SupplierController.getOptions
);

// 获取单个供应商
router.get('/:id', 
  validateId,
  handleValidationErrors,
  SupplierController.getById
);

// 创建供应商
router.post('/', 
  authenticateToken,
  requireOperator,
  validateSupplier,
  handleValidationErrors,
  SupplierController.create
);

// 更新供应商
router.put('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  validateSupplier,
  handleValidationErrors,
  SupplierController.updateById
);

// 删除供应商
router.delete('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  handleValidationErrors,
  SupplierController.deleteById
);

module.exports = router;