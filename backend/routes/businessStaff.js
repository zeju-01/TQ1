// 业务人员管理路由
const express = require('express');
const router = express.Router();
const BusinessStaffController = require('../controllers/BusinessStaffController');
const { authenticateToken, requireOperator } = require('../middleware/auth');
const { validateBusinessStaff, validateId, validatePagination, handleValidationErrors } = require('../utils/validation');

// 获取所有业务人员
router.get('/', 
  validatePagination,
  handleValidationErrors,
  BusinessStaffController.getList
);

// 获取业务人员选项（用于下拉框）
router.get('/options', 
  BusinessStaffController.getOptions
);

// 获取职务列表
router.get('/positions', 
  BusinessStaffController.getPositions
);

// 根据职务获取业务人员
router.get('/position/:position', 
  BusinessStaffController.getByPosition
);

// 获取单个业务人员
router.get('/:id', 
  validateId,
  handleValidationErrors,
  BusinessStaffController.getById
);

// 创建业务人员
router.post('/', 
  authenticateToken,
  requireOperator,
  validateBusinessStaff,
  handleValidationErrors,
  BusinessStaffController.create
);

// 更新业务人员
router.put('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  validateBusinessStaff,
  handleValidationErrors,
  BusinessStaffController.updateById
);

// 删除业务人员
router.delete('/:id', 
  authenticateToken,
  requireOperator,
  validateId,
  handleValidationErrors,
  BusinessStaffController.deleteById
);

module.exports = router;