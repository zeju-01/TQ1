// 库存管理路由
const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');
const { authenticateToken, requireOperator } = require('../middleware/auth');
const { validateStockIn, validateStockOut, validateId, validatePagination, handleValidationErrors, validateIMEI } = require('../utils/validation');
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

// 获取最大的入库单号
router.get('/max-stock-in-number', 
  authenticateToken,
  requireOperator,
  InventoryController.getMaxStockInNumber
);

// 根据条件搜索入库单号
router.get('/search-stock-in-numbers', 
  authenticateToken,
  requireOperator,
  InventoryController.searchStockInNumbers
);

// 根据入库单号获取入库记录
router.get('/stock-in-records', 
  authenticateToken,
  requireOperator,
  InventoryController.getStockInRecordsByNumber
);

// 根据IMEI查询库存
router.get('/imei/:imei', 
  InventoryController.getByIMEI
);

// 根据批次号查询库存
router.get('/batch/:batch_number', 
  InventoryController.getByBatch
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
    body('stockInList.*.product_name').optional().notEmpty().withMessage('产品名称不能为空'),
    body('stockInList.*.stock_in_date').optional().notEmpty().withMessage('入库时间不能为空'),
    body('stockInList.*.stock_in_quantity').optional().isInt({ min: 1 }).withMessage('入库数量必须为正整数'),
    body('stockInList.*.imei').optional().custom((value) => {
      if (value && !validateIMEI(value)) {
        throw new Error('IMEI号格式不正确，应为15位数字');
      }
      return true;
    })
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

// 批量更新库存信息
router.post('/batch-update', 
  authenticateToken,
  requireOperator,
  InventoryController.batchUpdate
);

// 批量恢复库存信息
router.post('/batch-restore', 
  authenticateToken,
  requireOperator,
  InventoryController.batchRestore
);

// 更新库存信息
router.put('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  handleValidationErrors,
  InventoryController.updateById
);

// 删除库存记录
router.delete('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  handleValidationErrors,
  InventoryController.deleteById
);

// 获取库存详情
router.get('/:id', 
  validateId,
  handleValidationErrors,
  InventoryController.getById
);

module.exports = router;