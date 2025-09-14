// 文件上传控制器
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { successResponse, errorResponse } = require('../utils/response');

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif').split(',');
    const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

class UploadController {
  // 单文件上传
  static uploadSingle = upload.single('file');
  
  static async handleSingleUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(errorResponse('没有上传文件', 'NO_FILE_UPLOADED'));
      }

      const fileInfo = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`
      };

      res.json(successResponse('文件上传成功', fileInfo));
    } catch (error) {
      console.error('文件上传错误:', error);
      res.status(500).json(errorResponse('文件上传失败', 'UPLOAD_FAILED'));
    }
  }

  // 多文件上传
  static uploadMultiple = upload.array('files', 10);
  
  static async handleMultipleUpload(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(errorResponse('没有上传文件', 'NO_FILES_UPLOADED'));
      }

      const filesInfo = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${file.filename}`
      }));

      res.json(successResponse('文件上传成功', filesInfo));
    } catch (error) {
      console.error('多文件上传错误:', error);
      res.status(500).json(errorResponse('文件上传失败', 'UPLOAD_FAILED'));
    }
  }

  // Excel文件导入
  static uploadExcel = upload.single('excel');
  
  static async handleExcelImport(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(errorResponse('没有上传Excel文件', 'NO_EXCEL_UPLOADED'));
      }

      // 读取Excel文件
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // 转换为JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // 验证数据格式
      if (jsonData.length === 0) {
        return res.status(400).json(errorResponse('Excel文件为空', 'EMPTY_EXCEL_FILE'));
      }

      // 删除临时文件
      fs.unlinkSync(req.file.path);

      res.json(successResponse('Excel导入成功', {
        filename: req.file.originalname,
        rowCount: jsonData.length,
        data: jsonData
      }));
    } catch (error) {
      console.error('Excel导入错误:', error);
      
      // 清理临时文件
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json(errorResponse('Excel导入失败', 'EXCEL_IMPORT_FAILED'));
    }
  }

  // 删除文件
  static async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads', filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json(errorResponse('文件不存在', 'FILE_NOT_FOUND'));
      }

      fs.unlinkSync(filePath);
      res.json(successResponse('文件删除成功'));
    } catch (error) {
      console.error('删除文件错误:', error);
      res.status(500).json(errorResponse('删除文件失败', 'DELETE_FILE_FAILED'));
    }
  }
}

module.exports = UploadController;