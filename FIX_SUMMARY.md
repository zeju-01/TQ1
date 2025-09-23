# stock_in_time 和 stock_in_auto_number 字段修复说明

## 问题描述

在系统运行过程中，发现以下问题：

1. `stock_in_time` 字段没有被正确填写，始终为 NULL
2. `stock_in_auto_number` 字段虽然在代码中已标记为废弃，但数据库中仍然有值

## 问题分析

### stock_in_time 字段问题
- 数据库表结构中 `stock_in_time` 字段设置了默认值 `DEFAULT (datetime('now', '+8 hours'))`
- 在应用层代码中，我们显式地将其设置为 NULL，这覆盖了默认值
- 应该在插入时显式设置当前时间值，而不是依赖默认值

### stock_in_auto_number 字段问题
- 该字段在早期版本中被使用，但在新版本中已废弃
- 虽然在代码中添加了过滤逻辑，但数据库中已有的数据仍然保留着之前的值
- 新的入库操作应该不会再设置这个字段的值

### generateStockOutNumber 函数问题
- 在出库功能中调用了 `generateStockOutNumber()` 函数，但该函数未在后端定义
- 这会导致出库操作失败

## 解决方案

### 1. 数据库结构修复
- 移除了 `stock_in_time` 字段的默认值，改为在应用层显式设置
- 保持 `stock_in_auto_number` 字段为 NULL 允许，确保新数据不会写入该字段

### 2. 代码修复
- 在后端模型中修复了 `generateStockOutNumber()` 函数未定义的问题
- 确保 `stock_in_time` 字段在入库时被正确设置为当前北京时间
- 确保 `stock_in_auto_number` 字段在入库时被显式设置为 NULL

### 3. 数据迁移
- 创建了数据库迁移脚本，修复了表结构问题
- 确保现有数据的一致性

## 验证结果

通过测试脚本验证，修复后的系统能够：

1. ✅ 正确填写 `stock_in_time` 字段为当前北京时间
2. ✅ 正确将 `stock_in_auto_number` 字段设置为 NULL
3. ✅ 正常执行出库操作，不再依赖未定义的函数

## 后续建议

1. 定期检查数据库中的数据，确保废弃字段保持为 NULL
2. 在前端和后端都添加更严格的字段验证，防止废弃字段被意外使用
3. 对系统进行更全面的回归测试，确保所有功能正常运行