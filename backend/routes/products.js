// 产品管理路由
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { authenticateToken, requireOperator } = require('../middleware/auth');
const { validateProduct, validateId, validatePagination, handleValidationErrors } = require('../utils/validation');

// 获取所有产品
router.get('/', 
  validatePagination,
  handleValidationErrors,
  ProductController.getList
);

// 获取产品选项（用于下拉框）
router.get('/options', 
  ProductController.getOptions
);

// 获取运营商列表
router.get('/operators', 
  ProductController.getOperators
);

// 获取供应商列表（从产品表）
router.get('/suppliers', 
  ProductController.getSuppliers
);

// 获取快递公司列表
router.get('/couriers', 
  ProductController.getCouriers
);

// 根据运营商获取产品
router.get('/operator/:operator', 
  ProductController.getByOperator
);

// 获取单个产品
router.get('/:id', 
  validateId,
  handleValidationErrors,
  ProductController.getById
);

// 创建产品
router.post('/', 
  authenticateToken,
  requireOperator,
  validateProduct,
  handleValidationErrors,
  ProductController.create
);

// 更新产品
router.put('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  validateProduct,
  handleValidationErrors,
  ProductController.updateById
);

// 删除产品
router.delete('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  handleValidationErrors,
  ProductController.deleteById
);

module.exports = router;