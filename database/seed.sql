-- 互联网模组出入库管理系统测试数据脚本
-- 创建时间: 2025-09-14
-- 版本: 1.0

USE `iot_inventory_management`;

-- 插入测试用户数据
INSERT INTO `users` (`username`, `password`, `role`, `full_name`, `abbreviation`, `permission`, `remarks`) VALUES
('admin', '$2a$10$K7JG1QnGQ5V8H4wG3WnGqeZg7jWCQ3t9h8K5L2N1P4R6S8T0U2V4X', 'superadmin', '系统管理员', 'ADM', 'all', '系统超级管理员账户'),
('warehouse_mgr', '$2a$10$K7JG1QnGQ5V8H4wG3WnGqeZg7jWCQ3t9h8K5L2N1P4R6S8T0U2V4X', 'warehouse_manager', '仓库管理员', 'WM', 'manage', '仓库管理员账户'),
('operator1', '$2a$10$K7JG1QnGQ5V8H4wG3WnGqeZg7jWCQ3t9h8K5L2N1P4R6S8T0U2V4X', 'operator', '操作员张三', 'OP1', 'operate', '入库出库操作员'),
('operator2', '$2a$10$K7JG1QnGQ5V8H4wG3WnGqeZg7jWCQ3t9h8K5L2N1P4R6S8T0U2V4X', 'operator', '操作员李四', 'OP2', 'operate', '入库出库操作员'),
('viewer1', '$2a$10$K7JG1QnGQ5V8H4wG3WnGqeZg7jWCQ3t9h8K5L2N1P4R6S8T0U2V4X', 'viewer', '查看员王五', 'VW1', 'view', '只能查看库存信息');

-- 插入供应商测试数据
INSERT INTO `suppliers` (`company_name`, `contact_info`, `other_info`) VALUES
('深圳移远通信技术股份有限公司', '电话: 0755-86380030, 邮箱: sales@quectel.com', '全球领先的物联网模组供应商'),
('广和通无线股份有限公司', '电话: 0755-83756666, 邮箱: info@fibocom.com', '专业的无线通信模组和解决方案提供商'),
('美格智能技术股份有限公司', '电话: 0755-83230326, 邮箱: sales@meiglink.com', '专注于物联网模组的研发和生产'),
('有方科技股份有限公司', '电话: 0755-26855633, 邮箱: market@neoway.com', '物联网通信模组和解决方案供应商'),
('芯讯通无线科技(上海)有限公司', '电话: 021-51095990, 邮箱: info@simcom.com', '全球领先的M2M模组供应商');

-- 插入业务人员测试数据
INSERT INTO `business_staff` (`staff_name`, `nickname`, `position`, `contact_info`) VALUES
('陈晓明', '小明', '销售经理', '手机: 13800138001, 邮箱: chenxm@company.com'),
('刘佳丽', '佳佳', '客户经理', '手机: 13800138002, 邮箱: liujl@company.com'),
('张伟强', '阿强', '区域经理', '手机: 13800138003, 邮箱: zhangwq@company.com'),
('王丽华', '华华', '业务专员', '手机: 13800138004, 邮箱: wanglh@company.com'),
('李建国', '建国', '销售总监', '手机: 13800138005, 邮箱: lijg@company.com');

-- 插入产品测试数据
INSERT INTO `products` (`name`, `model`, `description`, `abbreviation`, `operator`, `supplier`, `salesperson`, `courier_company`) VALUES
('4G LTE Cat.1模组', 'EC200U-CN', '高性能4G LTE Cat.1通信模组，支持中国移动/联通/电信网络', 'EC200U', '中国移动', '移远通信', '陈晓明', '顺丰速运'),
('4G LTE Cat.4模组', 'EC600U-CN', '高速4G LTE Cat.4通信模组，下载速度150Mbps', 'EC600U', '中国联通', '移远通信', '刘佳丽', '中通快递'),
('NB-IoT模组', 'BC26', '低功耗广域网NB-IoT通信模组', 'BC26', '中国电信', '移远通信', '张伟强', '圆通快递'),
('2G GSM模组', 'M26', '成熟稳定的2G GSM通信模组', 'M26', '中国移动', '移远通信', '王丽华', '申通快递'),
('5G Sub-6GHz模组', 'RG500Q-EA', '5G Sub-6GHz高速通信模组', 'RG500Q', '中国移动', '移远通信', '李建国', '韵达快递');

-- 插入库存测试数据（入库记录）
-- 注意：这里的IMEI号码是模拟的15位数字，实际使用时应该是真实的IMEI号码
INSERT INTO `inventory` (
    `product_id`, `product_name`, `product_model`, `product_description`, `operator`, 
    `imei`, `batch_number`, `stock_in_quantity`, `stock_in_status`, `return_status`, 
    `after_sales_status`, `other_status`, `stock_in_number`, `supplier`, 
    `factory_name`, `factory_order`, `stock_in_date`, `stock_in_contract_number`, 
    `stock_in_document`, `stock_in_by`, `stock_in_notes`, `quantity`, `transaction_type`
) VALUES
-- 第一批入库数据
(1, '4G LTE Cat.1模组', 'EC200U-CN', '高性能4G LTE Cat.1通信模组', '中国移动', '867894050001001', 'BOX202509001', 1, '已入库', '正常', '正常', '正常', 'IN20250914001', '移远通信', '深圳工厂', 'WO2025001', '2025-09-01 09:00:00', 'CT2025001', '入库单据001.pdf', 'operator1', '第一批EC200U模组入库', 1, 'in'),
(1, '4G LTE Cat.1模组', 'EC200U-CN', '高性能4G LTE Cat.1通信模组', '中国移动', '867894050001002', 'BOX202509001', 1, '已入库', '正常', '正常', '正常', 'IN20250914002', '移远通信', '深圳工厂', 'WO2025001', '2025-09-01 09:00:00', 'CT2025001', '入库单据001.pdf', 'operator1', '第一批EC200U模组入库', 1, 'in'),
(1, '4G LTE Cat.1模组', 'EC200U-CN', '高性能4G LTE Cat.1通信模组', '中国移动', '867894050001003', 'BOX202509001', 1, '已入库', '正常', '正常', '正常', 'IN20250914003', '移远通信', '深圳工厂', 'WO2025001', '2025-09-01 09:00:00', 'CT2025001', '入库单据001.pdf', 'operator1', '第一批EC200U模组入库', 1, 'in'),

-- 第二批入库数据
(2, '4G LTE Cat.4模组', 'EC600U-CN', '高速4G LTE Cat.4通信模组', '中国联通', '867894050002001', 'BOX202509002', 1, '已入库', '正常', '正常', '正常', 'IN20250914004', '移远通信', '深圳工厂', 'WO2025002', '2025-09-02 10:30:00', 'CT2025002', '入库单据002.pdf', 'operator2', '第二批EC600U模组入库', 1, 'in'),
(2, '4G LTE Cat.4模组', 'EC600U-CN', '高速4G LTE Cat.4通信模组', '中国联通', '867894050002002', 'BOX202509002', 1, '已入库', '正常', '正常', '正常', 'IN20250914005', '移远通信', '深圳工厂', 'WO2025002', '2025-09-02 10:30:00', 'CT2025002', '入库单据002.pdf', 'operator2', '第二批EC600U模组入库', 1, 'in'),

-- 第三批入库数据（NB-IoT模组）
(3, 'NB-IoT模组', 'BC26', '低功耗广域网NB-IoT通信模组', '中国电信', '867894050003001', 'BOX202509003', 1, '已入库', '正常', '正常', '正常', 'IN20250914006', '移远通信', '深圳工厂', 'WO2025003', '2025-09-03 14:15:00', 'CT2025003', '入库单据003.pdf', 'operator1', 'NB-IoT模组批量入库', 1, 'in'),
(3, 'NB-IoT模组', 'BC26', '低功耗广域网NB-IoT通信模组', '中国电信', '867894050003002', 'BOX202509003', 1, '已入库', '正常', '正常', '正常', 'IN20250914007', '移远通信', '深圳工厂', 'WO2025003', '2025-09-03 14:15:00', 'CT2025003', '入库单据003.pdf', 'operator1', 'NB-IoT模组批量入库', 1, 'in'),
(3, 'NB-IoT模组', 'BC26', '低功耗广域网NB-IoT通信模组', '中国电信', '867894050003003', 'BOX202509003', 1, '已入库', '正常', '正常', '正常', 'IN20250914008', '移远通信', '深圳工厂', 'WO2025003', '2025-09-03 14:15:00', 'CT2025003', '入库单据003.pdf', 'operator1', 'NB-IoT模组批量入库', 1, 'in'),

-- 部分出库记录
(1, '4G LTE Cat.1模组', 'EC200U-CN', '高性能4G LTE Cat.1通信模组', '中国移动', '867894050001004', 'BOX202509001', 1, '已入库', '正常', '正常', '正常', 'IN20250914009', '移远通信', '深圳工厂', 'WO2025001', '2025-09-01 09:00:00', 'CT2025001', '入库单据001.pdf', 'operator1', '已出库的EC200U模组', 1, 'out'),

(2, '4G LTE Cat.4模组', 'EC600U-CN', '高速4G LTE Cat.4通信模组', '中国联通', '867894050002003', 'BOX202509002', 1, '已入库', '正常', '正常', '正常', 'IN20250914010', '移远通信', '深圳工厂', 'WO2025002', '2025-09-02 10:30:00', 'CT2025002', '入库单据002.pdf', 'operator2', '已出库的EC600U模组', 1, 'out');

-- 更新出库记录的出库信息
UPDATE `inventory` SET 
    `stock_out_number` = 'OUT20250910001',
    `stock_out_document` = '出库单据001.pdf',
    `stock_out_date` = '2025-09-10 15:30:00',
    `stock_out_quantity` = 1,
    `stock_out_contract_number` = 'CT2025001',
    `sales_order_number` = 'SO2025001',
    `recipient` = '北京物联网科技有限公司',
    `delivery_info` = '北京市朝阳区科技园区A座1001室，联系人：张经理，电话：010-12345678',
    `courier_company` = '顺丰速运',
    `tracking_number` = 'SF1234567890',
    `stock_out_time` = '2025-09-10 15:30:00',
    `stock_out_by` = 3,
    `stock_out_notes` = '客户急需，优先发货',
    `stock_out_status` = '已出库',
    `customer` = '北京物联网科技有限公司'
WHERE `imei` = '867894050001004';

UPDATE `inventory` SET 
    `stock_out_number` = 'OUT20250911001',
    `stock_out_document` = '出库单据002.pdf',
    `stock_out_date` = '2025-09-11 11:00:00',
    `stock_out_quantity` = 1,
    `stock_out_contract_number` = 'CT2025002',
    `sales_order_number` = 'SO2025002',
    `recipient` = '上海智能制造有限公司',
    `delivery_info` = '上海市浦东新区张江高科技园区B座2001室，联系人：李总，电话：021-87654321',
    `courier_company` = '中通快递',
    `tracking_number` = 'ZTO9876543210',
    `stock_out_time` = '2025-09-11 11:00:00',
    `stock_out_by` = 4,
    `stock_out_notes` = '按合同要求及时发货',
    `stock_out_status` = '已出库',
    `customer` = '上海智能制造有限公司'
WHERE `imei` = '867894050002003';

-- 插入一些退库记录
INSERT INTO `inventory` (
    `product_id`, `product_name`, `product_model`, `product_description`, `operator`, 
    `imei`, `batch_number`, `stock_in_quantity`, `stock_in_status`, `return_status`, 
    `after_sales_status`, `other_status`, `stock_in_number`, `supplier`, 
    `factory_name`, `factory_order`, `stock_in_date`, `stock_in_contract_number`, 
    `stock_in_document`, `stock_in_by`, `return_time`, `returned_by`, `return_reason`, 
    `return_type`, `return_notes`, `stock_in_notes`, `quantity`, `transaction_type`
) VALUES
(4, '2G GSM模组', 'M26', '成熟稳定的2G GSM通信模组', '中国移动', '867894050004001', 'BOX202509004', 1, '已入库', '已退库', '正常', '正常', 'IN20250914011', '移远通信', '深圳工厂', 'WO2025004', '2025-09-05 16:00:00', 'CT2025004', '入库单据004.pdf', 'operator1', '2025-09-12 09:30:00', 3, '产品质量问题', '质量退库', '模组存在功能缺陷，需要退回供应商处理', 'M26模组入库后发现质量问题', 1, 'return');

-- 更新序列计数器以反映当前使用情况
UPDATE `sequence_counters` SET `current_value` = 20 WHERE `name` = 'stock_in_auto_number';
UPDATE `sequence_counters` SET `current_value` = 10 WHERE `name` = 'stock_out_auto_number';

-- 验证数据插入
SELECT '用户数据' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT '供应商数据', COUNT(*) FROM suppliers
UNION ALL
SELECT '业务人员数据', COUNT(*) FROM business_staff
UNION ALL
SELECT '产品数据', COUNT(*) FROM products
UNION ALL
SELECT '库存数据', COUNT(*) FROM inventory;

-- 显示库存状态统计
SELECT 
    '总库存' as status_type,
    COUNT(*) as count
FROM inventory
UNION ALL
SELECT 
    CONCAT('入库状态-', COALESCE(stock_in_status, '未设置')),
    COUNT(*)
FROM inventory
GROUP BY stock_in_status
UNION ALL
SELECT 
    CONCAT('出库状态-', COALESCE(stock_out_status, '未出库')),
    COUNT(*)
FROM inventory
GROUP BY stock_out_status
UNION ALL
SELECT 
    CONCAT('交易类型-', transaction_type),
    COUNT(*)
FROM inventory
GROUP BY transaction_type;