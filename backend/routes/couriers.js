// 快递公司管理路由
const express = require('express');
const router = express.Router();
const CourierController = require('../controllers/CourierController');
const { authenticateToken, requireOperator } = require('../middleware/auth');
const { validateCourier, validateId, validatePagination, handleValidationErrors } = require('../utils/validation');

// 获取所有快递公司
router.get('/', 
  validatePagination,
  handleValidationErrors,
  CourierController.getList
);

// 获取快递公司选项（用于下拉框）
router.get('/options', 
  CourierController.getOptions
);

// 获取单个快递公司
router.get('/:id', 
  validateId,
  handleValidationErrors,
  CourierController.getById
);

// 创建快递公司
router.post('/', 
  authenticateToken,
  requireOperator,
  validateCourier,
  handleValidationErrors,
  CourierController.create
);

// 更新快递公司
router.put('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  validateCourier,
  handleValidationErrors,
  CourierController.updateById
);

// 删除快递公司
router.delete('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  handleValidationErrors,
  CourierController.deleteById
);

module.exports = router;