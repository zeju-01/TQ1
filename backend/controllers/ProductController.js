// 产品管理控制器
const ProductModel = require('../models/Product');
const { successResponse, errorResponse, paginatedResponse, calculatePagination } = require('../utils/response');
const { parsePaginationParams, parseSortParams, parseSearchParams } = require('../utils/response');

class ProductController {
  // 创建产品
  static async create(req, res) {
    try {
      const productData = req.body;
      const product = await ProductModel.create(productData);
      
      res.status(201).json(successResponse('产品创建成功', product));
    } catch (error) {
      console.error('创建产品错误:', error);
      res.status(500).json(errorResponse('创建产品失败', 'CREATE_PRODUCT_FAILED'));
    }
  }

  // 获取产品列表
  static async getList(req, res) {
    try {
      const { page, limit, offset } = parsePaginationParams(req);
      const { field: sortBy, order: sortOrder } = parseSortParams(req, ['id', 'name', 'model', 'operator', 'created_at', 'updated_at']);
      const search = req.query.search || '';

      const result = await ProductModel.findAll(page, limit, search, sortBy, sortOrder);
      const pagination = calculatePagination(result.total, page, limit);

      res.json(paginatedResponse('获取产品列表成功', result.products, pagination));
    } catch (error) {
      console.error('获取产品列表错误:', error);
      res.status(500).json(errorResponse('获取产品列表失败', 'GET_PRODUCTS_FAILED'));
    }
  }

  // 获取产品详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);
      
      if (!product) {
        return res.status(404).json(errorResponse('产品不存在', 'PRODUCT_NOT_FOUND'));
      }

      res.json(successResponse('获取产品详情成功', product));
    } catch (error) {
      console.error('获取产品详情错误:', error);
      res.status(500).json(errorResponse('获取产品详情失败', 'GET_PRODUCT_FAILED'));
    }
  }

  // 更新产品
  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;

      // 检查产品是否存在
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json(errorResponse('产品不存在', 'PRODUCT_NOT_FOUND'));
      }

      const updatedProduct = await ProductModel.updateById(id, productData);
      res.json(successResponse('产品更新成功', updatedProduct));
    } catch (error) {
      console.error('更新产品错误:', error);
      res.status(500).json(errorResponse('更新产品失败', 'UPDATE_PRODUCT_FAILED'));
    }
  }

  // 删除产品
  static async deleteById(req, res) {
    try {
      const { id } = req.params;

      // 检查产品是否存在
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json(errorResponse('产品不存在', 'PRODUCT_NOT_FOUND'));
      }

      const success = await ProductModel.deleteById(id);
      if (success) {
        res.json(successResponse('产品删除成功'));
      } else {
        res.status(500).json(errorResponse('产品删除失败', 'DELETE_PRODUCT_FAILED'));
      }
    } catch (error) {
      console.error('删除产品错误:', error);
      
      if (error.message.includes('库存记录')) {
        return res.status(400).json(errorResponse(error.message, 'PRODUCT_IN_USE'));
      }
      
      res.status(500).json(errorResponse('删除产品失败', 'DELETE_PRODUCT_FAILED'));
    }
  }

  // 获取产品选项（用于下拉框）
  static async getOptions(req, res) {
    try {
      const options = await ProductModel.getOptions();
      res.json(successResponse('获取产品选项成功', options));
    } catch (error) {
      console.error('获取产品选项错误:', error);
      res.status(500).json(errorResponse('获取产品选项失败', 'GET_PRODUCT_OPTIONS_FAILED'));
    }
  }

  // 根据运营商获取产品
  static async getByOperator(req, res) {
    try {
      // 注意：这个方法现在可能不再需要，因为我们已经移除了operator字段
      // 但为了保持向后兼容性，我们返回空数组
      res.json(successResponse('获取运营商产品成功', []));
    } catch (error) {
      console.error('获取运营商产品错误:', error);
      res.status(500).json(errorResponse('获取运营商产品失败', 'GET_PRODUCTS_BY_OPERATOR_FAILED'));
    }
  }

  // 获取运营商列表
  static async getOperators(req, res) {
    try {
      // 注意：这个方法现在可能不再需要，因为我们已经移除了operator字段
      // 但为了保持向后兼容性，我们返回空数组
      res.json(successResponse('获取运营商列表成功', []));
    } catch (error) {
      console.error('获取运营商列表错误:', error);
      res.status(500).json(errorResponse('获取运营商列表失败', 'GET_OPERATORS_FAILED'));
    }
  }

  // 获取供应商列表（从产品表）
  static async getSuppliers(req, res) {
    try {
      // 注意：这个方法现在可能不再需要，因为我们已经移除了supplier字段
      // 但为了保持向后兼容性，我们返回空数组
      res.json(successResponse('获取供应商列表成功', []));
    } catch (error) {
      console.error('获取供应商列表错误:', error);
      res.status(500).json(errorResponse('获取供应商列表失败', 'GET_SUPPLIERS_FAILED'));
    }
  }

  // 获取快递公司列表
  static async getCouriers(req, res) {
    try {
      // 注意：这个方法现在可能不再需要，因为我们已经移除了courier_company字段
      // 但为了保持向后兼容性，我们返回空数组
      res.json(successResponse('获取快递公司列表成功', []));
    } catch (error) {
      console.error('获取快递公司列表错误:', error);
      res.status(500).json(errorResponse('获取快递公司列表失败', 'GET_COURIERS_FAILED'));
    }
  }
}

module.exports = ProductController;