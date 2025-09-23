-- 互联网模组出入库管理系统数据库初始化脚本
-- 创建时间: 2025-09-14
-- 版本: 1.0

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `iot_inventory_management` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `iot_inventory_management`;

-- 用户表 (users)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色',
    `full_name` VARCHAR(100) NULL COMMENT '全名',
    `abbreviation` VARCHAR(20) NULL COMMENT '缩写',
    `permission` VARCHAR(20) DEFAULT 'view' COMMENT '权限',
    `remarks` TEXT NULL COMMENT '备注',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 产品信息表 (products)
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '产品ID',
    `name` VARCHAR(100) NULL COMMENT '产品名称',
    `model` VARCHAR(50) NULL COMMENT '产品型号',
    `description` TEXT NULL COMMENT '产品描述',
    `abbreviation` VARCHAR(20) NULL COMMENT '产品缩写',
    `operator` VARCHAR(50) NULL COMMENT '运营商',
    `supplier` VARCHAR(100) NULL COMMENT '供应商',
    `salesperson` VARCHAR(50) NULL COMMENT '业务人员',
    `courier_company` VARCHAR(50) NULL COMMENT '快递公司',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品信息表';

-- 供应商信息表 (suppliers)
CREATE TABLE IF NOT EXISTS `suppliers` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '供应商ID',
    `company_name` VARCHAR(100) NOT NULL COMMENT '公司名称',
    `contact_info` VARCHAR(200) NULL COMMENT '联系方式',
    `other_info` TEXT NULL COMMENT '其他信息',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='供应商信息表';

-- 业务信息表 (business_staff)
CREATE TABLE IF NOT EXISTS `business_staff` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '业务员ID',
    `staff_name` VARCHAR(50) NOT NULL COMMENT '业务人员',
    `nickname` VARCHAR(50) NULL COMMENT '花名',
    `position` VARCHAR(50) NULL COMMENT '职务',
    `contact_info` VARCHAR(200) NULL COMMENT '联系方式',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务信息表';

-- 库存主表 (inventory)
CREATE TABLE IF NOT EXISTS `inventory` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '库存ID',
    
    -- 基本产品信息
    `product_id` INT NULL COMMENT '产品ID',
    `product_name` VARCHAR(100) NULL COMMENT '产品名称',
    `product_model` VARCHAR(50) NULL COMMENT '产品型号',
    `product_description` TEXT NULL COMMENT '产品描述',
    `operator` VARCHAR(50) NULL COMMENT '运营商',
    `imei` VARCHAR(50) UNIQUE COMMENT 'IMEI号',
    `batch_number` VARCHAR(50) NULL COMMENT '箱号',
    
    -- 入库相关字段
    `stock_in_quantity` INT NULL COMMENT '入库数量',
    `stock_in_status` VARCHAR(20) NULL COMMENT '入库状态',
    `return_status` VARCHAR(20) NULL COMMENT '退库状态',
    `after_sales_status` VARCHAR(20) NULL COMMENT '售后状态',
    `other_status` VARCHAR(20) NULL COMMENT '其它状态',
    `stock_in_number` VARCHAR(50) NULL COMMENT '入库单号',
    `stock_in_auto_number` VARCHAR(50) NULL COMMENT '系统自动编号（已废弃）',
    `supplier` VARCHAR(100) NULL COMMENT '供应商',
    `factory_name` VARCHAR(100) NULL COMMENT '工厂名称',
    `factory_order` VARCHAR(50) NULL COMMENT '工厂工单',
    `stock_in_date` TIMESTAMP NULL COMMENT '入库时间',
    `stock_in_contract_number` VARCHAR(50) NULL COMMENT '入库合同号',
    `stock_in_document` VARCHAR(100) NULL COMMENT '入库单据名称',
    `stock_in_document_path` VARCHAR(255) NULL COMMENT '入库单据文件路径',
    `stock_in_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '入库操作时间',
    `stock_in_by` VARCHAR(50) NULL COMMENT '入库操作用户',
    `return_time` TIMESTAMP NULL COMMENT '退库操作时间',
    `returned_by` INT NULL COMMENT '退库操作用户',
    `return_reason` VARCHAR(100) NULL COMMENT '退库原因',
    `return_type` VARCHAR(20) NULL COMMENT '退库类型',
    `return_notes` TEXT NULL COMMENT '退库备注',
    `after_sales_time` TIMESTAMP NULL COMMENT '售后操作时间',
    `after_sales_by` INT NULL COMMENT '售后操作用户',
    `stock_in_notes` TEXT NULL COMMENT '入库备注',
    
    -- 出库相关字段
    `stock_out_number` VARCHAR(50) NULL COMMENT '出库单号',
    `stock_out_document` VARCHAR(100) NULL COMMENT '出库单据名称',
    `stock_out_document_path` VARCHAR(255) NULL COMMENT '出库单据文件路径',
    `stock_out_date` TIMESTAMP NULL COMMENT '出库时间',
    `stock_out_quantity` INT NULL COMMENT '出库数量',
    `stock_out_contract_number` VARCHAR(50) NULL COMMENT '出库合同号',
    `sales_order_number` VARCHAR(50) NULL COMMENT '销售单号',
    `recipient` VARCHAR(100) NULL COMMENT '领用对象',
    `delivery_info` TEXT NULL COMMENT '收货信息',
    `courier_company` VARCHAR(50) NULL COMMENT '快递公司',
    `tracking_number` VARCHAR(50) NULL COMMENT '快递单号',
    `stock_out_time` TIMESTAMP NULL COMMENT '出库操作时间',
    `stock_out_by` INT NULL COMMENT '出库操作用户',
    `stock_out_notes` TEXT NULL COMMENT '出库备注',
    
    -- 其他字段
    `stock_out_status` VARCHAR(20) NULL COMMENT '出库状态',
    `quantity` INT NULL COMMENT '数量',
    `transaction_type` VARCHAR(10) NOT NULL COMMENT '交易类型',
    `customer` VARCHAR(100) NULL COMMENT '合同客户名',
    
    -- 时间戳
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 外键约束
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`returned_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`after_sales_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`stock_out_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存主表';

-- 创建索引以提高查询性能
CREATE INDEX `idx_inventory_imei` ON `inventory`(`imei`);
CREATE INDEX `idx_inventory_product_id` ON `inventory`(`product_id`);
CREATE INDEX `idx_inventory_stock_in_number` ON `inventory`(`stock_in_number`);
CREATE INDEX `idx_inventory_stock_out_number` ON `inventory`(`stock_out_number`);
CREATE INDEX `idx_inventory_stock_in_date` ON `inventory`(`stock_in_date`);
CREATE INDEX `idx_inventory_stock_out_date` ON `inventory`(`stock_out_date`);
CREATE INDEX `idx_inventory_transaction_type` ON `inventory`(`transaction_type`);
CREATE INDEX `idx_inventory_stock_in_status` ON `inventory`(`stock_in_status`);
CREATE INDEX `idx_inventory_stock_out_status` ON `inventory`(`stock_out_status`);

-- 创建用于自动编号的序列表
CREATE TABLE IF NOT EXISTS `sequence_counters` (
    `name` VARCHAR(50) PRIMARY KEY COMMENT '序列名称',
    `current_value` BIGINT DEFAULT 0 COMMENT '当前值',
    `increment` INT DEFAULT 1 COMMENT '增量',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='序列计数器表';

-- 初始化序列计数器
INSERT INTO `sequence_counters` (`name`, `current_value`) VALUES 
('stock_out_auto_number', 0)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 创建获取下一个序列值的存储过程
DELIMITER //
CREATE PROCEDURE GetNextSequence(IN seq_name VARCHAR(50), OUT next_val BIGINT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    UPDATE `sequence_counters` 
    SET `current_value` = `current_value` + `increment`
    WHERE `name` = seq_name;
    
    SELECT `current_value` INTO next_val 
    FROM `sequence_counters` 
    WHERE `name` = seq_name;
    
    COMMIT;
END //
DELIMITER ;

-- 创建生成出库自动编号的函数
DELIMITER //
CREATE FUNCTION GenerateStockOutNumber() RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_val BIGINT;
    DECLARE date_str VARCHAR(8);
    DECLARE result VARCHAR(50);
    
    CALL GetNextSequence('stock_out_auto_number', next_val);
    SET date_str = DATE_FORMAT(NOW(), '%Y%m%d');
    SET result = CONCAT('OUT', date_str, LPAD(next_val, 6, '0'));
    
    RETURN result;
END //
DELIMITER ;

