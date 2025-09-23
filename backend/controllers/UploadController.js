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
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,xls,xlsx,csv,jpg,jpeg,png,gif').split(',');
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

      // 检查是否需要重命名文件
      let finalFilename = req.file.filename;
      let finalPath = req.file.path;
      let finalUrl = `/uploads/${req.file.filename}`;
      
      // 如果前端传递了自定义文件名，则重命名文件
      if (req.body.custom_filename) {
        const customFilename = req.body.custom_filename;
        const uploadDir = path.join(__dirname, '../uploads');
        finalPath = path.join(uploadDir, customFilename);
        finalFilename = customFilename;
        finalUrl = `/uploads/${customFilename}`;
        
        // 重命名文件
        fs.renameSync(req.file.path, finalPath);
      }

      const fileInfo = {
        filename: finalFilename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: finalPath,
        url: finalUrl
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

      const filesInfo = [];
      
      // 处理每个上传的文件
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        // 检查是否需要重命名文件
        let finalFilename = file.filename;
        let finalPath = file.path;
        let finalUrl = `/uploads/${file.filename}`;
        
        // 如果前端传递了自定义文件名，则重命名文件
        if (req.body.custom_filenames && req.body.custom_filenames[i]) {
          const customFilename = req.body.custom_filenames[i];
          const uploadDir = path.join(__dirname, '../uploads');
          finalPath = path.join(uploadDir, customFilename);
          finalFilename = customFilename;
          finalUrl = `/uploads/${customFilename}`;
          
          // 重命名文件
          fs.renameSync(file.path, finalPath);
        }
        
        filesInfo.push({
          filename: finalFilename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: finalPath,
          url: finalUrl
        });
      }

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

      let jsonData = [];
      
      // 检查文件扩展名
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      
      if (fileExt === '.csv') {
        // 处理CSV文件，使用更 robust 的方式
        const csvData = fs.readFileSync(req.file.path, 'utf8');
        const lines = csvData.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length <= 1) {
          return res.status(400).json(errorResponse('CSV文件为空', 'EMPTY_CSV_FILE'));
        }
        
        // 解析CSV头部
        const headers = lines[0].split(',').map(header => header.trim());
        
        // 解析数据行
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(value => value.trim());
          if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
              // 处理可能被引号包围的值
              let value = values[index];
              if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
              }
              row[header] = value;
            });
            jsonData.push(row);
          }
        }
      } else {
        // 处理Excel文件
        const workbook = XLSX.readFile(req.file.path, {cellDates: true});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 转换为JSON，确保日期格式正确
        jsonData = XLSX.utils.sheet_to_json(worksheet, {raw: false, dateNF: 'yyyy-mm-dd hh:mm:ss'});
      }
      
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