// 库存管理路由
const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');
const { authenticateToken, requireOperator } = require('../middleware/auth');
const { validateStockIn, validateStockOut, validateId, validatePagination, handleValidationErrors } = require('../utils/validation');
const { body } = require('express-validator');

// 获取库存列表
router.get('/', 
  validatePagination,
  handleValidationErrors,
  InventoryController.getList
);

// 获取库存统计
router.get('/stats', 
  InventoryController.getStats
);

// 检查IMEI是否可用
router.get('/check-imei/:imei', 
  InventoryController.checkIMEI
);

// 根据IMEI查询库存
router.get('/imei/:imei', 
  InventoryController.getByIMEI
);

// 根据批次号查询库存
router.get('/batch/:batch_number', 
  InventoryController.getByBatch
);

// 获取库存详情
router.get('/:id', 
  validateId,
  handleValidationErrors,
  InventoryController.getById
);

// 入库操作
router.post('/stock-in', 
  authenticateToken,
  requireOperator,
  validateStockIn,
  handleValidationErrors,
  InventoryController.stockIn
);

// 批量入库
router.post('/stock-in/batch', 
  authenticateToken,
  requireOperator,
  [
    body('stockInList').isArray({ min: 1 }).withMessage('入库列表不能为空'),
    body('stockInList.*.imei').notEmpty().withMessage('IMEI号不能为空')
  ],
  handleValidationErrors,
  InventoryController.batchStockIn
);

// 出库操作
router.post('/stock-out', 
  authenticateToken,
  requireOperator,
  validateStockOut,
  handleValidationErrors,
  InventoryController.stockOut
);

// 退库操作
router.post('/return', 
  authenticateToken,
  requireOperator,
  [
    body('imei').notEmpty().withMessage('IMEI号不能为空'),
    body('return_reason').notEmpty().withMessage('退库原因不能为空'),
    body('return_type').notEmpty().withMessage('退库类型不能为空')
  ],
  handleValidationErrors,
  InventoryController.returnStock
);

// 更新库存信息
router.put('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  handleValidationErrors,
  InventoryController.updateById
);

module.exports = router;