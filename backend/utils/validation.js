// 验证工具函数
const { body, param, query, validationResult } = require('express-validator');

// 处理验证错误的中间件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('验证失败:', {
      body: req.body,
      errors: errors.array()
    });
    return res.status(400).json({
      success: false,
      message: '输入数据验证失败',
      errors: errors.array(),
      timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    });
  }
  next();
};

// 用户验证规则
const validateUser = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6位'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'operator', 'viewer'])
    .withMessage('用户角色不正确'),
  body('full_name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('全名长度不能超过100字符'),
  body('abbreviation')
    .optional()
    .isLength({ max: 20 })
    .withMessage('缩写长度不能超过20字符'),
  body('permission')
    .optional()
    .isIn(['admin', 'manage', 'operate', 'view'])
    .withMessage('权限设置不正确')
];

// 登录验证规则
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('用户名不能为空'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

// 产品验证规则
const validateProduct = [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('产品名称长度不能超过100字符'),
  body('model')
    .optional()
    .isLength({ max: 50 })
    .withMessage('产品型号长度不能超过50字符'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('产品描述长度不能超过500字符'),
  body('abbreviation')
    .optional()
    .isLength({ max: 20 })
    .withMessage('产品缩写长度不能超过20字符')
];

// 供应商验证规则
const validateSupplier = [
  body('company_name')
    .notEmpty()
    .withMessage('公司名称不能为空')
    .isLength({ max: 100 })
    .withMessage('公司名称长度不能超过100字符'),
  body('contact_person')
    .optional()
    .isLength({ max: 100 })
    .withMessage('联系人姓名长度不能超过100字符'),
  body('phone')
    .optional(),
  body('email')
    .optional(),
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('地址长度不能超过255字符'),
  body('contact_info')
    .optional()
    .isLength({ max: 200 })
    .withMessage('联系方式长度不能超过200字符'),
  body('other_info')
    .optional()
    .isLength({ max: 500 })
    .withMessage('其他信息长度不能超过500字符')
];

// 业务人员验证规则
const validateBusinessStaff = [
  body('staff_name')
    .notEmpty()
    .withMessage('业务人员姓名不能为空')
    .isLength({ max: 50 })
    .withMessage('业务人员姓名长度不能超过50字符'),
  body('nickname')
    .optional()
    .isLength({ max: 50 })
    .withMessage('花名长度不能超过50字符'),
  body('position')
    .optional()
    .isLength({ max: 50 })
    .withMessage('职务长度不能超过50字符'),
  body('department')
    .optional()
    .isLength({ max: 50 })
    .withMessage('部门长度不能超过50字符'),
  body('phone')
    .optional(),
  body('email')
    .optional(),
  body('contact_info')
    .optional()
    .isLength({ max: 200 })
    .withMessage('联系方式长度不能超过200字符'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('状态值不正确')
];

// IMEI验证规则
const validateIMEI = (imei) => {
  // IMEI号应该是15位数字
  const imeiRegex = /^\d{15}$/;
  return imeiRegex.test(imei);
};

// 入库验证规则
const validateStockIn = [
  body('imei')
    .notEmpty()
    .withMessage('IMEI号不能为空')
    .custom((value) => {
      if (!validateIMEI(value)) {
        throw new Error('IMEI号格式不正确，应为15位数字');
      }
      return true;
    }),
  body('product_name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('产品名称长度不能超过100字符'),
  body('product_model')
    .optional()
    .isLength({ max: 50 })
    .withMessage('产品型号长度不能超过50字符'),
  body('stock_in_quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('入库数量必须为正整数'),
  body('supplier')
    .optional()
    .isLength({ max: 100 })
    .withMessage('供应商名称长度不能超过100字符'),
  body('batch_number')
    .optional()
    .isLength({ max: 50 })
    .withMessage('箱号长度不能超过50字符')
];

// 出库验证规则
const validateStockOut = [
  body('imei')
    .notEmpty()
    .withMessage('IMEI号不能为空')
    .custom((value) => {
      if (!validateIMEI(value)) {
        throw new Error('IMEI号格式不正确，应为15位数字');
      }
      return true;
    }),
  body('stock_out_quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('出库数量必须为正整数'),
  body('recipient')
    .optional()
    .isLength({ max: 100 })
    .withMessage('领用对象长度不能超过100字符'),
  body('customer')
    .optional()
    .isLength({ max: 100 })
    .withMessage('客户名称长度不能超过100字符')
];

// ID参数验证
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID必须为正整数')
];

// 分页参数验证
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须为正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间')
];

// 运营商验证规则
const validateOperator = [
  body('name')
    .notEmpty()
    .withMessage('运营商名称不能为空')
    .isLength({ max: 100 })
    .withMessage('运营商名称长度不能超过100字符'),
  body('code')
    .optional()
    .isLength({ max: 50 })
    .withMessage('运营商代码长度不能超过50字符'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('描述长度不能超过500字符'),
  body('contact_person')
    .optional()
    .isLength({ max: 100 })
    .withMessage('联系人姓名长度不能超过100字符'),
  body('phone')
    .optional(),
  body('email')
    .optional(),
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('地址长度不能超过255字符')
];

// 快递公司验证规则
const validateCourier = [
  body('name')
    .notEmpty()
    .withMessage('快递公司名称不能为空')
    .isLength({ max: 100 })
    .withMessage('快递公司名称长度不能超过100字符'),
  body('code')
    .optional()
    .isLength({ max: 50 })
    .withMessage('快递公司代码长度不能超过50字符'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('描述长度不能超过500字符'),
  body('contact_person')
    .optional()
    .isLength({ max: 100 })
    .withMessage('联系人姓名长度不能超过100字符'),
  body('phone')
    .optional(),
  body('email')
    .optional(),
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('地址长度不能超过255字符'),
  body('tracking_url')
    .optional()
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateLogin,
  validateProduct,
  validateSupplier,
  validateBusinessStaff,
  validateStockIn,
  validateStockOut,
  validateOperator,
  validateCourier,
  validateId,
  validatePagination,
  validateIMEI
};