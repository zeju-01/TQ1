# 收货单据文件上传和存储功能说明

## 功能概述

本功能实现了在点击"确认入库"时，将收货单据的名称存入数据库字段 `stock_in_document`，并将文件上传到 `uploads` 目录。

## 实现细节

### 1. 前端实现

**文件**: `frontend/src/pages/inventory/StockInPage.tsx`

- 在入库表单中添加了"收货单据"上传控件
- 用户可以选择并上传收货单据文件（支持图片、PDF、文档等格式）
- 上传的文件会自动重命名为 `{入库单号}_{序号}.{扩展名}` 格式
- 文件名会传递给后端的 `stock_in_document` 字段

### 2. 后端实现

**文件**: 
- `backend/controllers/InventoryController.js`
- `backend/models/Inventory.js`
- `backend/controllers/UploadController.js`

#### 2.1 文件上传处理
- 使用 `multer` 处理文件上传
- 文件保存在 `backend/uploads` 目录中
- 支持自定义文件名重命名

#### 2.2 入库数据处理
- 在 `createStockIn` 方法中接收 `stock_in_document` 参数
- 将文件名存储到数据库的 `stock_in_document` 字段中

### 3. 数据库实现

**文件**: `database/init.sql`

- 在 `inventory` 表中定义了 `stock_in_document` 字段
- 字段类型: `VARCHAR(100) NULL`
- 用于存储收货单据文件名

## 使用流程

1. 用户在入库表单中填写产品信息
2. 用户点击"收货单据"上传控件，选择文件
3. 用户点击"确认入库"按钮
4. 系统自动将文件上传到 `uploads` 目录
5. 系统将文件名存储到数据库的 `stock_in_document` 字段
6. 入库操作完成

## 文件命名规则

上传的收货单据文件会按照以下规则重命名：
```
{入库单号}_{序号}.{文件扩展名}
```

例如：
```
SI202509230001_1.pdf
SI202509230001_2.jpg
```

## 验证功能

可以通过以下方式验证功能是否正常工作：

1. 检查数据库中的 `stock_in_document` 字段是否包含正确的文件名
2. 检查 `backend/uploads` 目录中是否存在对应的文件
3. 在前端界面中查看入库记录，确认收货单据信息是否正确显示

## 注意事项

1. 文件大小限制：最大10MB
2. 支持的文件类型：图片、PDF、Word、Excel等常见文档格式
3. 文件名会自动重命名以避免冲突
4. 如果上传失败，系统会继续执行入库操作，但会在界面中提示用户