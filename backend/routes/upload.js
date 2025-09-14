// 文件上传路由
const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/UploadController');
const { authenticateToken, requireOperator } = require('../middleware/auth');

// 单文件上传
router.post('/single', 
  authenticateToken,
  requireOperator,
  UploadController.uploadSingle,
  UploadController.handleSingleUpload
);

// 多文件上传
router.post('/multiple', 
  authenticateToken,
  requireOperator,
  UploadController.uploadMultiple,
  UploadController.handleMultipleUpload
);

// Excel导入
router.post('/excel', 
  authenticateToken,
  requireOperator,
  UploadController.uploadExcel,
  UploadController.handleExcelImport
);

// 文件删除
router.delete('/:filename', 
  authenticateToken,
  requireOperator,
  UploadController.deleteFile
);

module.exports = router;