# 互联网模组出入库管理系统设计文档

## 1. 概述

### 系统目标
设计一个基于Web的出入库管理系统，专门用于管理具有唯一IMEI号的互联网模组设备。系统提供完整的库存管理、出入库记录、设备追踪和数据统计功能。

### 核心功能
- 入库管理（批量/单个入库，包含IMEI唯一性检查）
- 出库管理（批量/单个出库）
- 退库管理（产品退库、退货录入）
- 库存查询与统计
- 出入库记录追踪
- 用户权限管理
- 数据报表生成

### 技术特点
- 响应式Web界面，支持PC和移动端
- 实时库存状态更新
- 条码/二维码扫描支持
- 数据导入导出功能
- 多级权限控制

## 2. 系统架构

### 整体架构
```
graph TB
    A[前端Web应用] --> B[API网关]
    B --> C[身份认证服务]
    B --> D[业务逻辑层]
    D --> E[数据访问层]
    E --> F[数据库]
    
    D --> G[入库管理服务]
    D --> H[库存管理服务]
    D --> I[出库服务]
    D --> I1[退库管理服务]
    D --> J[报表服务]
    
    K[外部系统] --> B
    L[条码扫描器] --> A
```

### 技术栈选择
- **前端**: React/Vue.js + TypeScript
- **后端**: Node.js/Java Spring Boot
- **数据库**: MySQL/PostgreSQL
- **缓存**: Redis
- **消息队列**: RabbitMQ/Kafka (可选)
- **文件存储**: 本地存储/OSS
- **文件上传**: Multer/Express-fileupload

## 3. 数据模型设计

### 核心实体关系图
```
erDiagram
    USER {
        int id PK "用户ID"
        string username "用户名"
        string password "密码"
        string role "角色"
        string full_name "全名"
        string abbreviation "缩写"
        string permission "权限"
        text remarks "备注"
    }
    
    PRODUCT {
        int id PK "产品ID"
        string name "产品名称"
        string model "产品型号"
        text description "产品描述"
        string abbreviation "产品缩写"
        string operator "运营商"
        string supplier "供应商"
        string salesperson "业务人员"
        string courier_company "快递公司"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    SUPPLIER {
        int id PK "供应商ID"
        string company_name "公司名称"
        string contact_info "联系方式"
        text other_info "其他信息"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    BUSINESS_STAFF {
        int id PK "业务员ID"
        string staff_name "业务人员"
        string nickname "花名"
        string position "职务"
        string contact_info "联系方式"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    INVENTORY {
        int id PK "库存ID"
        int product_id FK "产品ID"
        string product_name "产品名称"
        string product_model "产品型号"
        text product_description "产品描述"
        string operator "运营商"
        string imei "IMEI号"
        string batch_number "箱号"
        
        int stock_in_quantity "入库数量"
        string stock_in_status "入库状态"
        string return_status "退库状态"
        string after_sales_status "售后状态"
        string other_status "其它状态"
        string stock_in_number "入库单号"
        string stock_in_auto_number "系统自动编号"
        string supplier "供应商"
        string factory_name "工厂名称"
        string factory_order "工厂工单"
        datetime stock_in_date "入库时间"
        string stock_in_contract_number "入库合同号"
        string stock_in_document "入库单据"
        string stock_in_document_path "入库单据文件路径"
        datetime stock_in_time "入库操作时间"
        string stock_in_by "入库操作用户"
        datetime return_time "退库操作时间"
        int returned_by FK "退库操作用户"
        string return_reason "退库原因"
        string return_type "退库类型"
        text return_notes "退库备注"
        datetime after_sales_time "售后操作时间"
        int after_sales_by FK "售后操作用户"
        text stock_in_notes "入库备注"
        
        string stock_out_number "出库单号"
        string stock_out_document "出库单据名称"
        string stock_out_document_path "出库单据文件路径"
        datetime stock_out_date "出库时间"
        int stock_out_quantity "出库数量"
        string stock_out_contract_number "出库合同号"
        string sales_order_number "销售单号"
        string recipient "领用对象"
        text delivery_info "收货信息"
        string courier_company "快递公司"
        string tracking_number "快递单号"
        datetime stock_out_time "出库操作时间"
        int stock_out_by FK "出库操作用户"
        text stock_out_notes "出库备注"
        
        string stock_out_status "出库状态"
        int quantity "数量"
        string transaction_type "交易类型"
        string customer "合同客户名"
    }
    
    PRODUCT ||--o{ INVENTORY : "一对多"
    USER ||--o{ INVENTORY : "入库操作员"
    USER ||--o{ INVENTORY : "出库操作员"
    USER ||--o{ INVENTORY : "退库操作员"
    USER ||--o{ INVENTORY : "售后操作员"
    SUPPLIER ||--o{ INVENTORY : "供应商关联"
    BUSINESS_STAFF ||--o{ INVENTORY : "业务员关联"
```

### 数据表详细设计

#### 用户表 (users)
| 字段名 | 类型 | 约束 | 说明 |
|--------|----- |------|------|
| id | INTEGER | PRIMARY KEY | 序号 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(100) | NOT NULL | 密码 |
| role | VARCHAR(20) | DEFAULT 'user' | 角色 |
| full_name | VARCHAR(100) | NULL | 全名 |
| abbreviation | VARCHAR(20) | NULL | 缩写 |
| permission | VARCHAR(20) | DEFAULT 'view' | 权限 |
| remarks | TEXT | NULL | 备注 |

#### 产品信息表 (products)
| 字段名 | 类型 | 约束 | 说明 |
|--------|----- |------|------|
| id | INTEGER | PRIMARY KEY | 序号 |
| name | VARCHAR(100) | NULL | 产品名称 |
| model | VARCHAR(50) | NULL | 产品型号 |
| description | TEXT | NULL | 产品描述 |
| abbreviation | VARCHAR(20) | NULL | 产品缩写 |
| operator | VARCHAR(50) | NULL | 运营商 |
| supplier | VARCHAR(100) | NULL | 供应商 |
| salesperson | VARCHAR(50) | NULL | 业务人员 |
| courier_company | VARCHAR(50) | NULL | 快递公司 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE NOW() | 更新时间 |

#### 供应商信息表 (suppliers)
| 字段名 | 类型 | 约束 | 说明 |
|--------|----- |------|------|
| id | INTEGER | PRIMARY KEY | 序号 |
| company_name | VARCHAR(100) | NOT NULL | 公司名称 |
| contact_info | VARCHAR(200) | NULL | 联系方式 |
| other_info | TEXT | NULL | 其他信息 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE NOW() | 更新时间 |

#### 业务信息表 (business_staff)
| 字段名 | 类型 | 约束 | 说明 |
|--------|----- |------|------|
| id | INTEGER | PRIMARY KEY | 序号 |
| staff_name | VARCHAR(50) | NOT NULL | 业务人员 |
| nickname | VARCHAR(50) | NULL | 花名 |
| position | VARCHAR(50) | NULL | 职务 |
| contact_info | VARCHAR(200) | NULL | 联系方式 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE NOW() | 更新时间 |

#### 库存主表 (inventory)
| 字段名 | 类型 | 约束 | 说明 |
|--------|----- |------|------|
| id | INTEGER | PRIMARY KEY | 序号 |
| product_id | INTEGER | FOREIGN KEY | 产品ID |
| product_name | VARCHAR(100) | NULL | 产品名称 |
| product_model | VARCHAR(50) | NULL | 产品型号 |
| product_description | TEXT | NULL | 产品描述 |
| operator | VARCHAR(50) | NULL | 运营商 |
| imei | VARCHAR(50) | UNIQUE | IMEI号 |
| batch_number | VARCHAR(50) | NULL | 箱号 |

**入库相关字段**
| 字段名 | 类型 | 约束 | 说明 |
|--------|----- |------|------|
| stock_in_quantity | INTEGER | NULL | 入库数量 |
| stock_in_status | VARCHAR(20) | NULL | 入库状态 |
| return_status | VARCHAR(20) | NULL | 退库状态 |
| after_sales_status | VARCHAR(20) | NULL | 售后状态 |
| other_status | VARCHAR(20) | NULL | 其它状态 |
| stock_in_number | VARCHAR(50) | NULL | 入库单号 |
| stock_in_auto_number | VARCHAR(50) | UNIQUE, NOT NULL | 系统自动编号 |
| supplier | VARCHAR(100) | NULL | 供应商 |
| factory_name | VARCHAR(100) | NULL | 工厂名称 |
| factory_order | VARCHAR(50) | NULL | 工厂工单 |
| stock_in_date | TIMESTAMP | DEFAULT NOW() | 入库时间 |
| stock_in_contract_number | VARCHAR(50) | NULL | 入库合同号 |
| stock_in_document | VARCHAR(100) | NULL | 入库单据名称 |
| stock_in_document_path | VARCHAR(255) | NULL | 入库单据文件路径 |
| stock_in_time | TIMESTAMP | DEFAULT NOW() | 入库操作时间 |
| stock_in_by | VARCHAR(50) | NULL | 入库操作用户 |
| return_time | TIMESTAMP | NULL | 退库操作时间 |
| returned_by | INTEGER | FOREIGN KEY | 退库操作用户 |
| return_reason | VARCHAR(100) | NULL | 退库原因 |
| return_type | VARCHAR(20) | NULL | 退库类型 |
| return_notes | TEXT | NULL | 退库备注 |
| after_sales_time | TIMESTAMP | NULL | 售后操作时间 |
| after_sales_by | INTEGER | FOREIGN KEY | 售后操作用户 |
| stock_in_notes | TEXT | NULL | 入库备注 |

**出库相关字段**
| 字段名 | 类型 | 约束 | 说明 |
|--------|----- |------|------|
| stock_out_number | VARCHAR(50) | NULL | 出库单号 |
| stock_out_document | VARCHAR(100) | NULL | 出库单据名称 |
| stock_out_document_path | VARCHAR(255) | NULL | 出库单据文件路径 |
| stock_out_date | TIMESTAMP | NULL | 出库时间 |
| stock_out_quantity | INTEGER | NULL | 出库数量 |
| stock_out_contract_number | VARCHAR(50) | NULL | 出库合同号 |
| sales_order_number | VARCHAR(50) | NULL | 销售单号 |
| recipient | VARCHAR(100) | NULL | 领用对象 |
| delivery_info | TEXT | NULL | 收货信息 |
| courier_company | VARCHAR(50) | NULL | 快递公司 |
| tracking_number | VARCHAR(50) | NULL | 快递单号 |
| stock_out_time | TIMESTAMP | NULL | 出库操作时间 |
| stock_out_by | INTEGER | FOREIGN KEY | 出库操作用户 |
| stock_out_notes | TEXT | NULL | 出库备注 |

**其他字段**
| 字段名 | 类型 | 约束 | 说明 |
|--------|----- |------|------|
| stock_out_status | VARCHAR(20) | NULL | 出库状态 |
| quantity | INTEGER | NULL | 数量 |
| transaction_type | VARCHAR(10) | NOT NULL | 交易类型 |
| customer | VARCHAR(100) | NULL | 合同客户名 |

## 4. 功能模块设计

### 4.1 用户认证与权限管理

#### 用户角色定义
- **超级管理员**: 系统所有权限
- **仓库管理员**: 出入库操作、库存管理
- **操作员**: 基本出入库操作
- **查看员**: 仅查看权限

#### 权限控制矩阵
| 功能模块 | 超级管理员 | 仓库管理员 | 操作员 | 查看员 |
|----------|------------|------------|---------|---------|
| 用户管理 | ✓ | ✗ | ✗ | ✗ |
| 产品信息管理 | ✓ | ✓ | ✓ | ✓ |
| 入库操作 | ✓ | ✓ | ✓ | ✗ |
| 出库操作 | ✓ | ✓ | ✓ | ✗ |
| 退库操作 | ✓ | ✓ | ✓ | ✗ |
| 库存查询 | ✓ | ✓ | ✓ | ✓ |
| 数据报表 | ✓ | ✓ | ✗ | ✗ |
| 系统设置 | ✓ | ✗ | ✗ | ✗ |

### 4.2 产品管理模块

#### 产品信息管理
- **产品录入**: 产品名称、型号、描述、运营商
- **产品编辑**: 修改产品信息
- **产品查询**: 按名称、型号、运营商查询
- **产品列表**: 显示所有产品信息

#### 供应商信息管理
- **供应商录入**: 公司名称、联系方式、其他信息
- **供应商编辑**: 修改供应商信息
- **供应商查询**: 按公司名称查询
- **供应商列表**: 显示所有供应商信息

#### 业务信息管理
- **业务员录入**: 业务人员、花名、职务、联系方式
- **业务员编辑**: 修改业务人员信息
- **业务员查询**: 按姓名、花名查询
- **业务员列表**: 显示所有业务人员信息

### 4.3 入库管理模块

#### 入库字段管理
全面管理以下入库相关信息：

**基本信息**
- 序号、产品名称、产品型号、产品描述
- 运营商、IMEI号、箱号

**入库业务信息**
- 入库数量、入库状态、退库状态
- 售后状态、其他状态
- 入库单号、供应商、工厂名称、工厂工单

**时间和操作信息**
- 入库时间、入库合同号、入库单据
- 入库操作时间、入库操作用户
- 退库操作时间、退库操作用户
- 售后操作时间、售后操作用户
- 入库备注

**单据上传功能**
- 支持入库单据文件上传（PDF、图片、Excel等格式）
- 单据文件存储和管理
- 单据文件查看和下载
- 支持多个单据文件关联同一入库记录

**表格导入入库功能**
- 支持Excel/CSV文件批量导入入库数据
- 标准化的导入模板下载
- 数据格式验证和错误提示
- 导入预览和确认机制
- 支持大批量数据导入（分批处理）

#### 入库业务流程
```
flowchart TD
    A[创建入库单] --> B[选择入库方式]
    B -->|单个入库| C[扫描/输入IMEI]
    B -->|批量入库| D[批量扫描/导入]
    B -->|表格导入| D1[上传Excel/CSV文件]
    
    C --> C1[系统自动生成入库单号]
    D --> D2[批量生成入库单号]
    D1 --> D3[表格数据解析和生成单号]
    
    C1 --> E[验证产品信息]
    D2 --> F[批量验证产品]
    D3 --> F1[表格数据验证]
    
    E --> G{产品是否存在?}
    F --> H{批量验证通过?}
    F1 --> H1{表格数据验证通过?}
    
    G -->|否| I[创建新产品记录]
    G -->|是| J[检查IMEI唯一性]
    H -->|否| K[显示错误列表]
    H -->|是| L[批量IMEI唯一性检查]
    H1 -->|否| K1[显示表格错误报告]
    H1 -->|是| L1[表格数据IMEI检查]
    
    I --> M[填写入库信息]
    J --> N{IMEI是否已存在?}
    L --> O[填写批量入库信息]
    L1 --> O1[表格数据预览确认]
    
    N -->|是| P[提示IMEI重复警告]
    N -->|否| M
    
    M --> Q[上传入库单据]
    O --> R[批量上传单据]
    P --> S[用户确认继续?]
    
    S -->|是| M
    S -->|否| A
    
    Q --> Q1[单据文件验证]
    R --> R1[批量单据验证]
    O1 --> O2[确认导入操作]
    
    Q1 --> T[确认入库信息]
    R1 --> U[确认批量入库]
    O2 --> U1[执行表格数据入库]
    
    T --> T1[更新库存记录]
    U --> U2[批量更新库存]
    U1 --> U3[批量更新表格数据]
    
    T1 --> V[生成入库记录]
    U2 --> W[生成批量入库记录]
    U3 --> W1[生成表格导入记录]
    
    V --> V1[生成入库单据文件]
    W --> W2[批量生成入库单据]
    W1 --> W3[生成导入结果报告]
    
    V1 --> X[入库完成]
    W2 --> X
    W3 --> X
```

#### 入库功能特性
- **条码扫描**: 支持IMEI条码快速录入
- **批量处理**: 支持Excel导入批量入库
- **表格导入**: 支持Excel/CSV文件批量导入入库数据
- **IMEI唯一性检查**: 自动检测重复IMEI号并提示
- **供应商管理**: 维护供应商信息
- **合同关联**: 关联入库合同号
- **状态跟踪**: 入库、退库、售后状态管理
- **单据上传**: 支持入库单据文件上传和管理
- **自动编号**: 系统自动生成唯一入库单号

#### 入库单自动生成系统详细设计

**核心功能说明**

入库单自动生成系统是整个入库管理模块的核心组件，确保每个入库操作都有唯一的、不重复的系统生成编号。该系统采用高并发安全的编号生成算法，支持大批量入库场景，同时保证编号的连续性和可追溯性。

**编号生成时机**

1. **单个入库**：用户选择单个入库时，系统立即生成一个入库单号
2. **批量入库**：用户选择批量入库时，系统一次性预分配多个连续编号
3. **表格导入**：解析表格数据后，根据有效数据行数批量生成编号
4. **API调用**：外部系统通过API请求时实时生成

**编号格式规范**

- **标准格式**：`IN{YYYYMMDD}{6位流水号}`
- **格式示例**：`IN20240101000001`（2024年1月1日第1条入库记录）
- **字符总长度**：16位
- **前缀含义**：IN代表InBound（入库）
- **日期格式**：YYYYMMDD（年月日）
- **流水号规则**：000001-999999（每日最多99万条记录）

**编号生成策略**

1. **日期隔离策略**
   - 每日编号独立计算，跨日自动重置
   - 支持历史日期补录（用于数据修正）
   - 自动处理年份、月份、日期变更

2. **并发安全策略**
   - 数据库行级锁确保原子性操作
   - 分布式锁支持多实例部署
   - 重试机制处理锁竞争
   - 超时保护防止死锁

3. **性能优化策略**
   - 批量操作预分配编号段
   - Redis缓存当日最大编号
   - 连接池复用数据库连接
   - 异步处理大批量请求

**编号唯一性保证机制**

1. **数据库约束**
   ```sql
   -- 在inventory表中为stock_in_auto_number字段添加唯一约束
   ALTER TABLE inventory ADD CONSTRAINT uk_stock_in_auto_number 
   UNIQUE (stock_in_auto_number);
   ```

2. **应用层检查**
   - 生成后立即验证唯一性
   - 检测到重复时自动递增重试
   - 最大重试次数限制（防止无限循环）

3. **分布式一致性**
   - 使用Redis分布式锁
   - 主从数据库读写分离时的一致性保证
   - 事务提交前的最终唯一性检查

**错误处理和容错机制**

1. **生成失败处理**
   ```python
   def generate_with_retry(max_retries=3):
       for attempt in range(max_retries):
           try:
               number = self.generate_number()
               if self.validate_uniqueness(number):
                   return number
           except Exception as e:
               if attempt == max_retries - 1:
                   raise NumberGenerationException(f"编号生成失败: {e}")
               time.sleep(0.1 * (2 ** attempt))  # 指数退避
   ```

2. **数据一致性修复**
   - 定时任务检查编号连续性
   - 发现断号时记录日志并预警
   - 支持手动修复断号（管理员操作）

3. **系统恢复机制**
   - 服务重启时自动同步最新编号
   - 缓存失效时从数据库重建
   - 数据库连接异常时的降级策略

**批量处理优化**

1. **编号预分配机制**
   ```python
   def reserve_number_range(count):
       """预分配指定数量的编号范围"""
       with self.get_distributed_lock():
           current_seq = self.get_current_sequence()
           start_seq = current_seq + 1
           end_seq = current_seq + count
           self.update_sequence(end_seq)
           return (start_seq, end_seq)
   ```

2. **批量验证机制**
   - 批量检查编号格式有效性
   - 批量验证编号唯一性
   - 分批处理大数据量（每批1000条）

3. **内存管理优化**
   - 流式处理避免内存溢出
   - 及时释放临时对象
   - 垃圾回收优化配置

**监控和告警体系**

1. **生成性能监控**
   - 编号生成平均耗时
   - 每秒处理请求数（TPS）
   - 成功率和失败率统计
   - 数据库连接池使用率

2. **业务指标监控**
   - 每日编号使用量
   - 编号使用率趋势
   - 峰值时段分析
   - 异常操作检测

3. **自动告警规则**
   ```yaml
   # 告警配置示例
   alerts:
     number_generation_failure:
       condition: "failure_rate > 1%"
       duration: "5m"
       actions: ["email", "sms", "webhook"]
     
     number_usage_high:
       condition: "daily_usage > 900000"
       actions: ["email", "notification"]
   ```

**用户体验优化**

1. **前端交互设计**
   - 编号生成进度指示器
   - 实时显示预览格式
   - 生成失败时友好提示
   - 批量操作进度条显示

2. **操作反馈机制**
   - 编号生成成功确认
   - 重复编号警告提示
   - 批量生成结果统计
   - 操作历史记录查询

**系统集成接口**

1. **RESTful API设计**
   ```
   POST /api/v1/inbound/numbers/generate
   {
     "count": 1,
     "date": "2024-01-01",
     "batch_id": "batch_123"
   }
   
   Response:
   {
     "success": true,
     "data": {
       "numbers": ["IN20240101000001"],
       "generated_at": "2024-01-01T10:30:00Z",
       "batch_id": "batch_123"
     }
   }
   ```

2. **Webhook通知支持**
   - 编号生成成功通知
   - 批量处理完成通知
   - 异常情况告警通知

**历史数据处理**

1. **数据迁移策略**
   - 老数据自动补充编号
   - 保持原有数据完整性
   - 迁移过程可回滚

2. **兼容性处理**
   - 支持多种编号格式并存
   - 新老系统平滑过渡
   - 查询接口向后兼容

#### 入库单据上传功能详细设计

**表格导入入库功能详细设计**

**支持的表格格式**
- Excel文件（.xlsx, .xls）
- CSV文件（.csv）
- TSV文件（.tsv）

**标准导入模板**

系统提供标准化的Excel模板，包含以下列：

| 列名 | 必填 | 数据类型 | 示例 | 说明 |
|------|------|----------|------|------|
| 产品名称 | 是 | 文本 | 互联网模组 | 产品名称 |
| 产品型号 | 否 | 文本 | LTE-M | 产品型号 |
| 产品描述 | 否 | 文本 | 4G模组 | 产品描述 |
| 运营商 | 否 | 文本 | 中国移动 | 运营商名称 |
| IMEI号 | 是 | 数字 | 123456789012345 | 15位数字 |
| 箱号 |是 | 文本 | BOX001 | 发货箱号 |
| 入库数量 | 是 | 数字 | 100 | 入库数量 |
| 供应商 | 否 | 文本 | 某某公司 | 供应商名称 |
| 工厂名称 | 否 | 文本 | ABC工厂 | 生产工厂 |
| 工厂工单 | 否 | 文本 | WO123456 | 工厂工单号 |
| 入库合同号 | 否 | 文本 | CT2024001 | 合同编号 |
| 入库备注 | 否 | 文本 | 备注信息 | 其他说明 |

**数据验证规则**

1. **必填字段验证**
   - 产品名称、产品型号、IMEI号、入库数量为必填项
   - 空值检查和提示

2. **数据格式验证**
   - IMEI号格式验证（15位数字）
   - 入库数量为正整数
   - 数据长度限制检查

3. **逻辑验证**
   - IMEI号唯一性检查
   - 产品信息一致性验证
   - 供应商信息检查

**导入流程详细设计**

``mermaid
flowchart TD
    A1[用户选择表格导入] --> B1[下载标准模板]
    B1 --> C1[用户填写数据]
    C1 --> D1[上传表格文件]
    D1 --> E1[文件格式验证]
    E1 --> F1{文件格式正确?}
    F1 -->|否| G1[显示格式错误信息]
    F1 -->|是| H1[解析表格数据]
    H1 --> I1[数据格式验证]
    I1 --> J1{数据验证通过?}
    J1 -->|否| K1[显示验证错误报告]
    J1 -->|是| L1[IMEI唯一性检查]
    L1 --> M1[数据预览展示]
    M1 --> N1[用户确认导入]
    N1 --> O1[执行批量导入]
    O1 --> P1[显示导入结果]
    
    G1 --> D1
    K1 --> Q1[用户修正数据]
    Q1 --> D1
```

**导入数据验证**

1. **文件级验证**
   - 文件大小限制：最大20MB
   - 文件格式检查：支持.xlsx/.xls/.csv
   - 文件完整性检查

2. **数据级验证**
   - 最大行数限制：20000行/批
   - 列映射检查：模板列与数据列匹配
   - 数据类型验证：数字、文本、日期格式

3. **业务级验证**
   - IMEI号唯一性检查
   - 产品信息关联检查
   - 供应商信息验证

**错误处理机制**

1. **验证错误报告**
   - 显示详细的错误信息和行号
   - 按错误类型分类显示
   - 提供修正建议

2. **数据清洗**
   - 自动去除空行和空列
   - 自动trim空格
   - 特殊字符过滤

3. **重复数据处理**
   - 检测文件内重复IMEI
   - 检测与数据库已有数据的冲突
   - 提供覆盖、跳过、合并选项

**性能优化**

1. **分批处理**
   - 大文件自动分批处理（每批500行）
   - 显示处理进度条
   - 支持取消操作

2. **异步处理**
   - 后台异步执行大批量导入
   - 实时显示处理状态
   - 导入完成后通知用户

3. **内存优化**
   - 流式读取大文件
   - 及时释放内存
   - 避免全量加载到内存

**用户界面设计**

1. **导入向导**
   - 步骤1：下载模板
   - 步骤2：上传数据文件
   - 步骤3：数据验证和预览
   - 步骤4：确认导入
   - 步骤5：查看结果

2. **数据预览表格**
   - 可编辑表格展示导入数据
   - 错误数据高亮显示
   - 支持在线修正错误数据
   - 支持选择性导入（去除错误行）

**导入日志管理**

1. **操作日志**
   - 记录导入操作的用户、时间、文件名
   - 记录导入数据量和结果
   - 记录错误信息和处理方式

2. **数据追溯**
   - 记录每条数据的来源文件和行号
   - 支持按批导入号查询数据
   - 支持数据源反向追查

**入库单自动编号系统设计**

**编号规则设计**

1. **编号格式定义**
   - 基本格式：`IN{YYYYMMDD}{6位流水号}`
   - 示例：`IN20240101000001`
   - 总长度：16位字符
   - 前缀：IN（InBound的缩写）
   - 日期部分：YYYYMMDD格式
   - 流水号：6位数字，支持每日999999条记录

2. **编号组成要素**
   ```
   IN  +  2024  01  01  +  000001
   │      │    │   │       │
   │      │    │   │       └─ 6位流水号
   │      │    │   └─────── 日期(日)
   │      │    └─────────── 日期(月)
   │      └─────────────── 日期(年)
   └─────────────────── 业务类型前缀
   ```

3. **可配置参数**
   - 前缀可配置：默认"IN"，可设置为其他值
   - 流水号位数：默认6位，可调整为4-8位
   - 日期格式：支持YYYYMMDD或YYMMDD
   - 分隔符：可选择无分隔符或使用"-"分隔

**编号生成算法**

1. **生成流程**
   ```mermaid
   flowchart TD
       A[开始生成入库单号] --> B[获取当前日期]
       B --> C[格式化日期 YYYYMMDD]
       C --> D[查询当日最大流水号]
       D --> E{是否存在当日记录?}
       E -->|否| F[流水号设为000001]
       E -->|是| G[最大流水号+1]
       F --> H[拼接完整编号]
       G --> H
       H --> I[检查编号唯一性]
       I --> J{编号是否存在?}
       J -->|是| K[流水号+1重试]
       J -->|否| L[返回生成的编号]
       K --> H
   ```

2. **数据库操作**
   ```sql
   -- 查询当日最大流水号
   SELECT MAX(CAST(RIGHT(stock_in_auto_number, 6) AS INTEGER)) as max_seq
   FROM inventory 
   WHERE stock_in_auto_number LIKE 'IN20240101%'
   AND DATE(stock_in_time) = '2024-01-01';
   
   -- 检查编号唯一性
   SELECT COUNT(*) FROM inventory 
   WHERE stock_in_auto_number = 'IN20240101000001';
   ```

3. **并发安全控制**
   - 使用数据库锁防止并发冲突
   - 原子性操作保证编号唯一性
   - 失败重试机制（最多重试3次）

**编号管理表设计**

创建专门的编号管理表：

```sql
CREATE TABLE sequence_number (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_type VARCHAR(10) NOT NULL,    -- 业务类型: 'inbound', 'outbound', 'return'
    date_key VARCHAR(8) NOT NULL,          -- 日期键: YYYYMMDD
    current_seq INT NOT NULL DEFAULT 0,    -- 当前流水号
    max_seq INT NOT NULL DEFAULT 999999,   -- 最大流水号
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP ON UPDATE NOW(),
    UNIQUE KEY uk_business_date (business_type, date_key)
);
```

**编号生成服务设计**

1. **服务接口设计**
   ```python
   class NumberGeneratorService:
       def generate_inbound_number(self, date=None):
           """
           生成入库单号
           :param date: 指定日期，默认为当前日期
           :return: 生成的入库单号
           """
           pass
       
       def validate_number_format(self, number):
           """
           验证编号格式
           :param number: 要验证的编号
           :return: 验证结果
           """
           pass
       
       def check_number_exists(self, number):
           """
           检查编号是否存在
           :param number: 要检查的编号
           :return: 是否存在
           """
           pass
   ```

2. **错误处理机制**
   - 编号生成失败重试
   - 数据库连接异常处理
   - 并发冲突解决
   - 日志记录和监控

**编号验证规则**

1. **格式验证**
   - 长度验证：16位字符
   - 前缀验证：必须以"IN"开头
   - 日期验证：符合YYYYMMDD格式且为有效日期
   - 流水号验证：6位数字且大于0

2. **业务验证**
   - 唯一性检查：数据库中不存在重复编号
   - 日期合理性：不能是未来日期
   - 流水号连续性：保证同一天内流水号连续

**系统配置管理**

1. **配置参数表**
   ```sql
   CREATE TABLE system_config (
       id INT PRIMARY KEY AUTO_INCREMENT,
       config_key VARCHAR(50) NOT NULL,
       config_value VARCHAR(200) NOT NULL,
       description TEXT,
       config_group VARCHAR(20) DEFAULT 'number_gen',
       is_active BOOLEAN DEFAULT TRUE,
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP ON UPDATE NOW(),
       UNIQUE KEY uk_config_key (config_key)
   );
   
   -- 初始化配置数据
   INSERT INTO system_config VALUES 
   (1, 'inbound_number_prefix', 'IN', '入库单号前缀', 'number_gen', 1, NOW(), NOW()),
   (2, 'inbound_number_seq_length', '6', '入库单号流水号位数', 'number_gen', 1, NOW(), NOW()),
   (3, 'inbound_number_date_format', 'YYYYMMDD', '入库单号日期格式', 'number_gen', 1, NOW(), NOW());
   ```

2. **配置管理界面**
   - 管理员可以配置编号规则
   - 支持实时预览生成效果
   - 配置变更日志记录

**特殊情况处理**

1. **跨日处理**
   - 系统跨日时流水号重置为000001
   - 支持按历史日期生成编号（用于数据补录）

2. **数据迁移处理**
   - 老数据迁移时自动生成编号
   - 兼容老编号规则
   - 数据一致性检查

3. **系统故障恢复**
   - 编号断号检测和修复
   - 数据一致性校验
   - 自动修复机制

**用户界面设计**

1. **编号生成界面**
   ```
   +--------------------------------------------------+
   |              入库单创建向导           |
   +--------------------------------------------------+
   | 步骤1: 选择入库方式                    |
   | [O] 单个入库  [O] 批量入库  [O] 表格导入 |
   |                                                |
   | 步骤2: 系统自动生成入库单号         |
   | 入库单号: [IN20240101000001] ✓自动生成 |
   | 预览格式: IN + 日期(YYYYMMDD) + 6位流水号 |
   |                                                |
   | 步骤3: 编号验证状态                    |
   | ✓ 编号格式正确                         |
   | ✓ 编号唯一性验证通过               |
   | ✓ 数据库连接正常                     |
   |                                                |
   | [重新生成]  [下一步]                |
   +--------------------------------------------------+
   ```

2. **编号管理界面**
   ```
   +--------------------------------------------------+
   |            入库单号管理系统          |
   +--------------------------------------------------+
   | 当日统计：                              |
   | 已生成: 1,234 个  剩余: 998,766 个    |
   | 最新编号: IN20240101001234               |
   |                                                |
   | 编号配置：                              |
   | 前缀: [IN] 流水号位数: [6位]        |
   | 日期格式: [YYYYMMDD]                    |
   |                                                |
   | 操作区域：                              |
   | [生成单个编号] [生成批量编号]   |
   | [验证编号] [修复断号]           |
   | [导出统计] [查看日志]           |
   +--------------------------------------------------+
   ```

3. **错误处理界面**
   ```
   +--------------------------------------------------+
   |              错误处理提示            |
   +--------------------------------------------------+
   | ⚠️ 编号生成失败！                    |
   |                                                |
   | 错误原因：数据库连接超时           |
   | 错误代码：DB_CONNECTION_TIMEOUT         |
   | 发生时间：2024-01-01 14:30:25           |
   |                                                |
   | 处理方案：                              |
   | 1. 系统将自动重试 (3/3 次)         |
   | 2. 请稍后手动重试                   |
   | 3. 联系系统管理员                     |
   |                                                |
   | [重试] [取消] [查看日志]        |
   +--------------------------------------------------+
   ```

**操作日志系统**

1. **日志记录范围**
   - 编号生成请求和结果
   - 编号验证和冲突处理
   - 数据库操作和异常
   - 系统性能指标
   - 用户操作行为

2. **日志级别定义**
   - **INFO**: 正常编号生成和操作
   - **WARN**: 重试操作和性能警告
   - **ERROR**: 生成失败和数据异常
   - **DEBUG**: 详细的技术信息

3. **日志格式设计**
   ```json
   {
     "timestamp": "2024-01-01T14:30:25.123Z",
     "level": "INFO",
     "operation": "generate_inbound_number",
     "user_id": "user123",
     "request_id": "req_abc123",
     "data": {
       "generated_number": "IN20240101000001",
       "generation_time_ms": 45,
       "retry_count": 0
     },
     "message": "成功生成入库单号"
   }
   ```

**系统集成接口**

1. **Webhook支持**
   ```python
   def trigger_webhook_on_number_generated(number, record_id):
       """
       编号生成后触发外部系统通知
       """
       webhook_data = {
           "event": "inbound_number_generated",
           "number": number,
           "record_id": record_id,
           "timestamp": datetime.now().isoformat()
       }
       # 发送到指定的Webhook URL
       send_webhook(webhook_data)
   ```

2. **消息队列集成**
   - 支持RabbitMQ/Kafka消息发布
   - 编号生成事件通知
   - 异步处理支持

**监控指标设计**

1. **性能指标**
   - 编号生成平均耗时
   - 每秒编号生成数量(TPS)
   - 编号生成成功率
   - 数据库连接池使用率

2. **业务指标**
   - 每日生成编号数量
   - 编号使用率趋势
   - 编号断号情况统计
   - 用户操作频率分析

3. **告警规则**
   ```yaml
   alerts:
     - name: 编号生成失败率过高
       condition: error_rate > 5%
       action: send_email, send_sms
     
     - name: 编号库存不足
       condition: remaining_numbers < 1000
       action: send_notification
     
     - name: 数据库连接异常
       condition: db_connection_failed
       action: send_alert, auto_restart
   ```

**测试策略**

1. **单元测试**
   ```python
   class TestInboundNumberGenerator:
       def test_number_format_validation(self):
           """测试编号格式验证"""
           valid_numbers = [
               "IN20240101000001",
               "IN20231231999999"
           ]
           invalid_numbers = [
               "IN2024010100000",  # 位数不足
               "XX20240101000001", # 前缀错误
               "IN20240132000001"  # 日期错误
           ]
           
       def test_concurrent_generation(self):
           """测试并发编号生成"""
           # 模拟100个并发请求
           threads = []
           results = []
           for i in range(100):
               thread = threading.Thread(
                   target=self.generate_and_store_result,
                   args=(results,)
               )
               threads.append(thread)
           
           # 启动所有线程
           for thread in threads:
               thread.start()
           
           # 等待所有线程完成
           for thread in threads:
               thread.join()
           
           # 验证结果唯一性
           assert len(set(results)) == len(results)
   ```

2. **集成测试**
   - 完整的入库流程测试
   - 数据库事务一致性测试
   - API接口集成测试
   - 异常情况处理测试

3. **性能测试**
   ```python
   class PerformanceTest:
       def test_batch_number_generation(self):
           """测试批量编号生成性能"""
           start_time = time.time()
           
           # 生成10000个编号
           numbers = self.generator.batch_generate(10000)
           
           end_time = time.time()
           duration = end_time - start_time
           
           # 验证性能指标
           assert duration < 5.0  # 5秒内完成
           assert len(numbers) == 10000
           assert len(set(numbers)) == 10000  # 保证唯一性
   ```

4. **压力测试**
   - 高并发请求测试
   - 长时间运行稳定性测试
   - 大数据量处理测试
   - 系统资源消耗测试

**数据迁移和升级策略**

1. **老数据迁移**
   ```sql
   -- 为已有数据生成编号
   UPDATE inventory 
   SET stock_in_auto_number = CONCAT(
       'IN',
       DATE_FORMAT(stock_in_time, '%Y%m%d'),
       LPAD((
           SELECT COUNT(*) + 1 
           FROM inventory i2 
           WHERE DATE(i2.stock_in_time) = DATE(inventory.stock_in_time)
           AND i2.id <= inventory.id
       ), 6, '0')
   )
   WHERE stock_in_auto_number IS NULL;
   ```

2. **版本升级兼容**
   - 支持多种编号格式并存
   - 新老系统平滑过渡
   - 数据备份和恢复机制

3. **灰度发布策略**
   - 按用户比例逐步开放新功能
   - A/B测试支持
   - 快速回滚机制

**安全性设计**

1. **数据安全**
   - 敏感信息加密存储
   - 数据访问权限控制
   - 数据备份和灾难恢复

2. **接口安全**
   - API访问频率限制
   - 身份验证和授权
   - HTTPS加密传输

3. **操作安全**
   - 操作日志审计
   - 敏感操作二次确认
   - 权限分离和最小权限原则

**性能优化细节**

1. **数据库优化**
   ```sql
   -- 为编号查询创建索引
   CREATE INDEX idx_stock_in_auto_number ON inventory(stock_in_auto_number);
   CREATE INDEX idx_stock_in_date ON inventory(DATE(stock_in_time));
   
   -- 为序列号表创建复合索引
   CREATE INDEX idx_sequence_business_date ON sequence_number(business_type, date_key);
   ```

2. **应用层优化**
   - 连接池配置优化
   - SQL查询优化
   - 缓存命中率提升
   - 异步处理优化

3. **系统资源优化**
   - CPU和内存使用监控
   - 网络带宽优化
   - 磁盘I/O优化
   - 负载均衡策略

**未来可扩展性**

1. **分布式支持**
   - 多数据中心部署
   - 跨区域编号生成
   - 分布式事务一致性

2. **微服务架构**
   - 编号生成服务独立部署
   - 服务注册与发现
   - 服务间通信优化

3. **云原生支持**
   - Kubernetes部署支持
   - 容器化运行
   - 自动扩缩容机制

**性能优化**

1. **缓存策略**
   - 编号生成算法缓存
   - 当日最大流水号缓存
   - 配置参数缓存

2. **批量处理**
   - 批量入库时预分配编号范围
   - 减少数据库访问次数
   - 提高并发处理能力

**API接口设计**

新增编号生成相关API：

```
POST   /inbound/generate-number        # 生成入库单号
POST   /inbound/validate-number        # 验证编号格式
GET    /inbound/number-preview         # 预览编号格式
GET    /inbound/number-config          # 获取编号配置
PUT    /inbound/number-config          # 更新编号配置
GET    /inbound/number-stats           # 编号统计信息
POST   /inbound/batch-generate-numbers # 批量生成编号（用于批量入库）
GET    /inbound/number-check/{number}  # 检查编号是否存在
POST   /inbound/number-reserve         # 预留编号（防止并发冲突）
```

**编号生成实现细节**

1. **原子性操作设计**
   ```sql
   -- 使用事务和行级锁确保编号生成的原子性
   BEGIN TRANSACTION;
   
   -- 锁定当日编号记录
   SELECT current_seq FROM sequence_number 
   WHERE business_type = 'inbound' AND date_key = '20240101'
   FOR UPDATE;
   
   -- 更新流水号
   UPDATE sequence_number 
   SET current_seq = current_seq + 1, updated_at = NOW()
   WHERE business_type = 'inbound' AND date_key = '20240101';
   
   -- 如果当日没有记录，插入新记录
   INSERT INTO sequence_number (business_type, date_key, current_seq) 
   VALUES ('inbound', '20240101', 1)
   ON DUPLICATE KEY UPDATE current_seq = current_seq + 1;
   
   COMMIT;
   ```

2. **并发控制机制**
   - 使用数据库行级锁（SELECT FOR UPDATE）
   - 分布式锁支持（Redis实现）
   - 重试机制（指数退避算法）
   - 超时控制（最大等待5秒）

3. **编号预留机制**
   ```python
   class NumberReservationService:
       def reserve_numbers(self, count, date=None):
           """
           预留指定数量的编号，返回编号范围
           :param count: 需要的编号数量
           :param date: 指定日期
           :return: (start_number, end_number)
           """
           with self.get_lock(f"inbound_number_{date}"):
               # 获取当前最大编号
               current_seq = self.get_current_sequence(date)
               # 预留指定数量的编号
               start_seq = current_seq + 1
               end_seq = current_seq + count
               # 更新序列号
               self.update_sequence(date, end_seq)
               return (start_seq, end_seq)
   ```

4. **错误恢复机制**
   - 编号断号检测和自动修复
   - 数据库连接异常重试
   - 编号冲突自动解决
   - 系统重启后的状态恢复

**高可用性设计**

1. **主从数据库支持**
   - 编号生成使用主库
   - 编号查询可使用从库
   - 主从切换时的一致性保证

2. **缓存策略**
   ```python
   class NumberCacheService:
       def __init__(self):
           self.redis_client = Redis()
           self.cache_prefix = "inbound_number_"
       
       def get_cached_sequence(self, date):
           """获取缓存的序列号"""
           cache_key = f"{self.cache_prefix}{date}"
           return self.redis_client.get(cache_key)
       
       def cache_sequence(self, date, sequence, expire=3600):
           """缓存序列号"""
           cache_key = f"{self.cache_prefix}{date}"
           self.redis_client.setex(cache_key, expire, sequence)
   ```

3. **监控和告警**
   - 编号生成失败监控
   - 编号重复检测告警
   - 编号生成性能监控
   - 数据库连接状态监控

**批量编号生成优化**

1. **批量预分配策略**
   ```python
   def batch_generate_numbers(self, batch_size, date=None):
       """
       批量生成编号，提高性能
       """
       if batch_size > 1000:
           # 大批量分段处理
           return self.segment_batch_generate(batch_size, date)
       else:
           # 小批量一次性处理
           return self.direct_batch_generate(batch_size, date)
   ```

2. **性能优化策略**
   - 批量操作减少数据库访问
   - 编号范围预分配
   - 异步编号生成（大批量场景）
   - 内存池管理编号缓存

**数据一致性保证**

1. **分布式事务**
   - 使用Two-Phase Commit确保数据一致性
   - 编号生成和库存记录创建的原子性
   - 失败回滚机制

2. **数据校验机制**
   ```python
   def validate_number_consistency(self):
       """
       验证编号一致性
       """
       # 检查编号连续性
       gaps = self.find_number_gaps()
       if gaps:
           self.log_number_gaps(gaps)
           
       # 检查重复编号
       duplicates = self.find_duplicate_numbers()
       if duplicates:
           self.handle_duplicate_numbers(duplicates)
   ```

**IMEI唯一性检查机制**
- **实时检查**: 在输入IMEI号时实时验证唯一性
- **批量检查**: 批量导入时对所有IMEI进行重复性检查
- **重复提示**: 明确显示重复IMEI号和已存在的记录信息
- **处理选项**: 允许用户选择覆盖或跳过重复数据
- **日志记录**: 记录所有IMEI检查和处理结果

**支持的文件格式**
- PDF文件（合同、发票等）
- 图片文件（JPG, PNG, JPEG）
- Excel文件（XLS, XLSX）
- Word文件（DOC, DOCX）
- 文本文件（TXT）

**文件上传限制**
- 单个文件大小限制：10MB
- 每次最多上传文件数：5个
- 文件名称限制：不超过50个字符

**文件存储策略**
- 文件命名规则：`{timestamp}_{original_filename}`
- 存储路径：`/uploads/inbound_documents/{year}/{month}/`
- 文件安全扫描：防止恶意文件上传
- 文件备份：自动备份到云存储

**单据管理功能**
- **文件预览**: 支持在线预览PDF和图片文件
- **文件下载**: 支持单个或批量下载
- **文件删除**: 支持删除不需要的单据文件
- **文件替换**: 支持替换已上传的单据文件
- **文件历史**: 记录文件上传、更新、删除的历史记录

### 4.4 出库管理模块

#### 出库字段管理
全面管理以下出库相关信息：

**出库基本信息**
- 序号、出库单号、出库时间、出库数量
- 出库合同号、销售单号、领用对象

**物流信息**
- 收货信息、快递公司、快递单号

**操作信息**
- 出库操作时间、出库操作用户、出库备注

**自动生成出库单功能**
- 自动生成标准化出库单据（PDF格式）
- 支持多种出库单模板（标准、简洁、详细）
- 出库单二维码生成，便于跟踪和查询
- 出库单自动编号系统
- 支持批量生成多个出库单

#### 出库业务流程
```
flowchart TD
    A[创建出库单] --> B[选择出库方式]
    B -->|按订单出库| C[输入订单信息]
    B -->|按需求出库| D[选择出库产品]
    
    C --> E[查询订单关联产品]
    D --> F[扫描/选择IMEI]
    
    E --> G[验证库存状态]
    F --> G
    
    G --> H{库存充足?}
    H -->|否| I[显示库存不足提示]
    H -->|是| J[填写出库信息]
    
    I --> K[调整出库数量]
    K --> G
    
    J --> L[选择出库产品]
    L --> M[填写物流信息]
    M --> N[确认出库清单]
    N --> O[执行出库操作]
    
    O --> P[更新库存状态]
    P --> Q[生成出库记录]
    Q --> Q1[自动生成出库单]
    Q1 --> Q2[生成二维码]
    Q2 --> R[打印/下载出库单]
    R --> S[出库完成]
```

#### 出库功能特性
- **智能分配**: 根据先进先出原则自动分配
- **批量出库**: 支持多个产品同时出库
- **订单管理**: 与订单系统集成
- **出库确认**: 双重确认机制防止误操作
- **单据打印**: 生成可打印的出库单据
- **物流跟踪**: 快递公司和快递单号跟踪
- **自动生成出库单**: 支持自动生成标准化出库单据
- **数据导出**: 支持多种格式的出库数据导出功能

#### 自动生成出库单功能详细设计

**出库单编号规则**
- 编号格式：`OUT{YYYYMMDD}{4位流水号}`
- 示例：`OUT202401010001`
- 支持自定义编号前缀和格式
- 自动检测重复编号并递增

**出库单模板类型**

1. **标准模板**
   - 包含完整的出库信息
   - 公司LOGO和联系方式
   - 详细的产品清单表格
   - 签名区域和日期

2. **简洁模板**
   - 只包含必要信息
   - 适合内部使用
   - 紧凑的版面设计

3. **详细模板**
   - 包含IMEI号明细
   - 产品规格详细描述
   - 质量检验信息
   - 完整的物流信息

**出库单内容结构**

```
+----------------------------------------------------------+
|                    公司名称/LOGO                        |
|                  互联网模组出库单                    |
+----------------------------------------------------------+
| 出库单号：OUT202401010001    日期：2024-01-01      |
| 操作员：张三                联系电话：138****8888  |
+----------------------------------------------------------+
| 领用对象：某某公司              合同号：CT2024001   |
| 收货地址：北京市朝阳区***路123号            |
| 联系人：李四    电话：139****9999              |
+----------------------------------------------------------+
|序号|产品名称|型号  |IMEI号      |数量|运营商|备注|
|  1 |互联网模组|LTE-M |123456789012345| 10 | 中国移动|    |
|  2 |互联网模组|NB-IoT|123456789012346|  5 | 中国联通|    |
+----------------------------------------------------------+
| 合计数量：15个                                       |
| 物流公司：顺丰快递        快递单号：SF1234567890   |
+----------------------------------------------------------+
| 出库员签名：____________    日期：_____________    |
| 验收人签名：____________    日期：_____________    |
+----------------------------------------------------------+
|                      [二维码]                        |
+----------------------------------------------------------+
```

**出库单生成流程**

```
flowchart TD
    A[出库操作完成] --> B[获取出库记录数据]
    B --> C[选择出库单模板]
    C --> D[生成出库单号]
    D --> E[填充出库单数据]
    E --> F[生成二维码]
    F --> G[渲染PDF文件]
    G --> H[保存出库单文件]
    H --> I[返回下载链接]
    I --> J[用户下载/打印]
```

**二维码生成功能**
- 二维码包含出库单号和基本信息
- 支持手机扫码快速查询出库记录
- 二维码数据格式：`{"type":"outbound","number":"OUT202401010001","date":"2024-01-01"}`

**批量生成功能**
- 支持一次性生成多个出库单
- 批量下载为ZIP压缩包
- 支持按日期范围批量生成

**出库数据导出功能详细设计**

**支持的导出格式**
- **Excel格式** (.xlsx, .xls)
  - 支持多工作表导出
  - 自动设置列宽和样式
  - 支持图表和公式嵌入

- **CSV格式** (.csv)
  - 轻量级数据交换格式
  - 适合大数据量导出
  - 兼容各种数据分析工具

- **PDF格式** (.pdf)
  - 保持格式不变
  - 适合打印和归档
  - 支持水印和数字签名

**导出数据类型**

1. **出库记录导出**
   - 单个出库记录导出
   - 批量出库记录导出
   - 按日期范围导出
   - 按客户/供应商导出

2. **出库统计导出**
   - 日报、周报、月报导出
   - 按产品类型统计导出
   - 按客户统计导出
   - 出库趋势分析导出

3. **出库明细导出**
   - 详细出库清单
   - IMEI号明细列表
   - 物流信息明细
   - 出库操作日志

**导出数据字段设计**

**基础出库信息字段**
| 字段名 | 中文名 | 数据类型 | 说明 |
|--------|--------|----------|------|
| outbound_id | 出库ID | 数字 | 唯一标识 |
| outbound_number | 出库单号 | 文本 | 系统生成 |
| outbound_date | 出库日期 | 日期 | YYYY-MM-DD |
| outbound_time | 出库时间 | 日期时间 | YYYY-MM-DD HH:mm:ss |
| product_name | 产品名称 | 文本 | 产品名称 |
| product_model | 产品型号 | 文本 | 产品型号 |
| imei | IMEI号 | 文本 | 15位数字 |
| quantity | 出库数量 | 数字 | 正整数 |
| operator | 运营商 | 文本 | 运营商名称 |

**业务相关字段**
| 字段名 | 中文名 | 数据类型 | 说明 |
|--------|--------|----------|------|
| contract_number | 合同号 | 文本 | 出库合同号 |
| sales_order | 销售单号 | 文本 | 销售订单号 |
| recipient | 领用对象 | 文本 | 收货客户 |
| customer | 客户名称 | 文本 | 合同客户 |
| delivery_info | 收货信息 | 文本 | 详细地址 |

**物流相关字段**
| 字段名 | 中文名 | 数据类型 | 说明 |
|--------|--------|----------|------|
| courier_company | 快递公司 | 文本 | 物流公司 |
| tracking_number | 快递单号 | 文本 | 物流跟踪号 |
| outbound_by | 出库操作人 | 文本 | 操作员姓名 |
| outbound_notes | 出库备注 | 文本 | 备注信息 |
| outbound_status | 出库状态 | 文本 | 当前状态 |

**导出条件设置**

1. **日期范围筛选**
   - 开始日期和结束日期
   - 快捷选择：今天、本周、本月、本季度
   - 自定义日期范围

2. **产品筛选**
   - 按产品名称筛选
   - 按产品型号筛选
   - 按运营商筛选
   - 支持多选和模糊查询

3. **客户筛选**
   - 按客户名称筛选
   - 按合同号筛选
   - 按销售单号筛选

4. **状态筛选**
   - 按出库状态筛选
   - 按操作人筛选
   - 按物流状态筛选

**导出模板管理**

1. **预设模板**
   - 标准出库记录模板
   - 出库统计模板
   - 物流追踪模板
   - 客户对账模板

2. **自定义模板**
   - 用户可自定义导出字段
   - 保存常用导出配置
   - 支持模板分享和复制

3. **模板管理功能**
   - 新建、编辑、删除模板
   - 模板预览和测试
   - 模板权限管理

**导出性能优化**

1. **大数据量处理**
   - 分批导出机制（每批最多10000条）
   - 异步导出处理
   - 导出进度显示
   - 支持取消导出操作

2. **内存管理**
   - 流式数据处理
   - 内存占用监控
   - 垃圾回收优化

3. **文件管理**
   - 临时文件自动清理
   - 文件大小限制和压缩
   - 文件下载链接管理

**导出安全控制**

1. **权限控制**
   - 导出权限检查
   - 数据范围限制（只能导出授权数据）
   - 敏感数据脱敏处理

2. **操作日志**
   - 记录所有导出操作
   - 导出数据范围和数量
   - 导出文件追踪

3. **数据加密**
   - 敏感数据加密导出
   - 文件密码保护
   - 水印和数字签名

**导出界面设计**

1. **导出向导界面**
   ```
   +--------------------------------------------------+
   |              出库数据导出向导                 |
   +--------------------------------------------------+
   | 步骤1: 选择导出类型                           |
   | [O] 出库记录  [O] 统计报表  [O] 明细清单   |
   |                                                |
   | 步骤2: 设置筛选条件                           |
   | 日期范围: [2024-01-01] 至 [2024-01-31]      |
   | 产品筛选: [选择产品...]                   |
   | 客户筛选: [选择客户...]                   |
   |                                                |
   | 步骤3: 选择导出模板                           |
   | [O] 标准模板  [O] 统计模板  [O] 自定义   |
   |                                                |
   | 步骤4: 选择导出格式                           |
   | [O] Excel  [O] CSV  [O] PDF                   |
   |                                                |
   | 步骤5: 确认并导出                             |
   | 预计导出数据: 1,234 条                     |
   | [取消]  [上一步]  [开始导出]              |
   +--------------------------------------------------+
   ```

2. **导出进度显示**
   ```
   +--------------------------------------------------+
   |                导出进度                      |
   +--------------------------------------------------+
   | 正在处理数据...                           |
   | ██████░░░░  60% (600/1000)        |
   |                                                |
   | 当前操作: 正在生成Excel文件...           |
   | 预计剩余时间: 2分钟                        |
   |                                                |
   | [取消导出]                                |
   +--------------------------------------------------+
   ```

3. **导出结果页面**
   ```
   +--------------------------------------------------+
   |              导出完成                        |
   +--------------------------------------------------+
   | ✓ 导出成功！                              |
   |                                                |
   | 文件名: 出库记录_20240101_20240131.xlsx   |
   | 文件大小: 2.5 MB                           |
   | 导出数据: 1,234 条                        |
   | 生成时间: 2024-01-31 14:30:25             |
   |                                                |
   | [下载文件]  [重新导出]  [返回列表]     |
   +--------------------------------------------------+
   ```

**API接口设计**

新增导出相关API端点：

```
GET    /outbound/export/templates      # 获取导出模板列表
POST   /outbound/export/preview        # 预览导出数据
POST   /outbound/export/excel          # 导出Excel文件
POST   /outbound/export/csv            # 导出CSV文件
POST   /outbound/export/pdf            # 导出PDF文件
GET    /outbound/export/status/{id}    # 查询导出状态
GET    /outbound/export/download/{id}  # 下载导出文件
DELETE /outbound/export/cancel/{id}   # 取消导出任务
GET    /outbound/export/history        # 获取导出历史
```
- **历史单据查询**: 按日期、单号查询历史出库单
- **单据重新生成**: 支持对已有记录重新生成出库单
- **模板管理**: 支持自定义出库单模板和样式
- **数据统计**: 统计出库单生成数量和频率

### 4.5 退库管理模块

#### 退库业务场景
退库管理包含多种业务场景：

**产品质量问题退库**
- 产品质量不合格
- 产品损坏或缺陷
- 产品型号错误

**业务需求退库**
- 客户取消订单
- 订单变更退回多余产品
- 业务调整需要退回

**库存管理退库**
- 库存盘点发现多余
- 过期产品退回
- 库存调整退库

#### 退库流程设计

``mermaid
flowchart TD
    A[发起退库申请] --> B[选择退库类型]
    B -->|单个退库| C[扫描/输入IMEI]
    B -->|批量退库| D[批量选择产品]
    B -->|按订单退库| E[选择出库订单]
    
    C --> F[查询产品状态]
    D --> G[批量状态检查]
    E --> H[查询订单产品清单]
    
    F --> I{产品是否已出库?}
    G --> J{批量产品状态正常?}
    H --> K[显示可退库产品列表]
    
    I -->|否| L[提示产品未出库]
    I -->|是| M[填写退库信息]
    J -->|否| N[显示状态异常产品]
    J -->|是| O[填写批量退库信息]
    K --> P[选择退库产品]
    
    L --> C
    M --> Q[选择退库原因]
    N --> D
    O --> R[选择批量退库原因]
    P --> S[填写订单退库信息]
    
    Q --> T[填写退库详情]
    R --> U[填写批量退库详情]
    S --> V[填写订单退库详情]
    
    T --> W[上传退库凭证]
    U --> X[上传批量退库凭证]
    V --> Y[上传订单退库凭证]
    
    W --> Z[提交退库申请]
    X --> Z
    Y --> Z
    
    Z --> AA[管理员审核]
    AA --> BB{审核通过?}
    BB -->|否| CC[返回修改意见]
    BB -->|是| DD[执行退库操作]
    
    CC --> Q
    DD --> EE[更新库存状态]
    EE --> FF[生成退库单]
    FF --> GG[退库完成]
```

#### 退库信息管理

**退库类型定义**
- **质量退库**: 产品质量问题导致的退库
- **业务退库**: 业务需求变化导致的退库
- **库存退库**: 库存管理需要的退库
- **其他退库**: 其他原因导致的退库

**退库原因管理**
- **质量问题**: 产品缺陷、损坏、不合格
- **型号错误**: 发货型号与订单不符
- **数量错误**: 发货数量超出订单需求
- **客户取消**: 客户主动取消订单
- **过期产品**: 产品超过保质期
- **库存调整**: 库存盘点或调整需要

**退库信息字段**
- 退库单号（自动生成）
- 退库类型和原因
- 退库产品清单（IMEI、数量等）
- 退库申请人和时间
- 审核人和审核结果
- 退库操作人和时间
- 退库备注和附件

#### 退库审核机制

**审核流程**
1. **申请提交**: 操作员提交退库申请
2. **初步审核**: 仓库管理员审核申请合理性
3. **终审核准**: 超级管理员终审（高价值产品）
4. **执行退库**: 审核通过后执行退库操作

**审核权限设定**
- **操作员**: 可申请退库，不能审核
- **仓库管理员**: 可审核一般退库申请
- **超级管理员**: 可审核所有退库申请

**审核标准**
- 退库原因是否合理
- 退库数量是否正确
- 相关凭证是否完整
- 产品状态是否允许退库

#### 退库单据管理

**退库单号规则**
- 编号格式：`RET{YYYYMMDD}{4位流水号}`
- 示例：`RET202401010001`
- 自动检测重复并递增

**退库凭证管理**
- 支持上传多种格式凭证文件
- 质量问题照片、视频记录
- 客户退货申请书
- 其他相关证明文件

**退库单生成**
- 自动生成标准化退库单
- 包含退库原因、产品清单、审核信息
- 支持PDF下载和打印
- 生成二维码便于追踪

#### 退库功能特性

- **灵活退库**: 支持单个、批量、按订单退库
- **原因追踪**: 详细记录退库原因和处理过程
- **审核流程**: 完整的退库审核机制
- **凭证管理**: 支持多种退库凭证上传
- **状态跟踪**: 实时跟踪退库进度和状态
- **数据统计**: 退库原因分析和统计报表
- **自动单据**: 自动生成退库单据和PDF

#### 库存查询界面设计
```
+----------------------------------------------------------+
|  Logo  |  互联网模组出入库管理系统  |  用户信息  |  退出  |
+----------------------------------------------------------+
| 导航菜单 |                主要内容区域                    |
|         |                                              |
| - 首页   |  +----------------------------------------+   |
| - 产品管理|  |            功能面板区域              |   |
| - 供应商  |  +----------------------------------------+   |
| - 业务人员|  |                                        |   |
| - 入库管理|  |            数据展示区域              |   |
| - 出库管理|  |                                        |   |
| - 库存查询|  |                                        |   |
| - 报表中心|  +----------------------------------------+   |
| - 系统设置|                                             |
+----------------------------------------------------------+
|                    状态栏/操作提示区                      |
+----------------------------------------------------------+
```

#### 产品管理页面
- **列表视图**: 表格形式展示产品信息
- **卡片视图**: 卡片形式展示，适合移动端
- **详情弹窗**: 点击查看详细信息
- **快速操作**: 编辑、删除、查看历史等

#### 入库管理页面
- **向导式界面**: 分步骤引导入库操作
- **IMEI输入区**: 支持扫码和手动输入，集成IMEI唯一性检查
- **字段表单**: 入库相关所有字段的表单填写
- **状态管理**: 入库、退库、售后等状态管理
- **实时反馈**: 操作结果即时显示，包括IMEI重复提示
- **批量操作**: 支持批量选择和操作
- **单据上传区**: 支持拖拽上传和文件选择上传
- **表格导入区**: 支持Excel/CSV文件上传和数据预览
- **模板下载**: 提供标准化导入模板下载
- **数据验证**: 实时数据验证和错误提示
- **自动编号显示**: 系统自动生成的入库单号实时显示
- **单据管理**: 已上传单据的查看、下载、删除功能

#### 出库管理页面
- **订单查询**: 根据订单号查询相关产品
- **产品选择**: 支持扫码和手动选择
- **物流信息**: 收货信息、快递公司、快递单号
- **出库确认**: 双重确认机制
- **出库单生成**: 自动生成出库单区域
- **模板选择**: 支持选择不同的出库单模板
- **单据预览**: 生成后可预览出库单效果
- **下载打印**: 支持PDF下载和直接打印
- **数据导出**: 导出功能入口，支持多种格式导出

#### 退库管理页面
- **退库申请**: 分步骤退库申请向导
- **产品选择**: 支持扫码和手动选择退库产品
- **原因选择**: 下拉选择退库类型和原因
- **凭证上传**: 支持上传退库凭证文件
- **审核流程**: 展示审核进度和状态
- **退库单生成**: 自动生成退库单区域
- **历史查询**: 查询历史退库记录和状态

### 4.6 报表管理模块

#### 报表类型设计
1. **库存报表**
   - 当前库存明细表
   - 库存汇总表
   - 库龄分析报表
   - 呆滞库存报表

2. **出入库报表**
   - 日/月/年出入库统计
   - 出入库明细表
   - 供应商出入库统计
   - 客户出库统计

3. **操作日志报表**
   - 用户操作记录
   - 异常操作报告
   - 系统访问日志

#### 报表生成流程
```
sequenceDiagram
    participant U as 用户
    participant W as Web前端
    participant A as API服务
    participant D as 数据库
    participant R as 报表引擎
    
    U->>W: 选择报表类型
    W->>A: 发送报表请求
    A->>D: 查询相关数据
    D-->>A: 返回数据结果
    A->>R: 调用报表生成
    R-->>A: 返回报表文件
    A-->>W: 返回下载链接
    W-->>U: 提供报表下载
```

## 5. 用户界面设计

### 5.1 主要页面布局

#### 系统主界面
```
+----------------------------------------------------------+
|  Logo  |  互联网模组出入库管理系统  |  用户信息  |  退出  |
+----------------------------------------------------------+
| 导航菜单 |                主要内容区域                    |
|         |                                              |
| - 首页   |  +----------------------------------------+   |
| - 产品管理|  |            功能面板区域              |   |
| - 供应商  |  +----------------------------------------+   |
| - 业务人员|  |                                        |   |
| - 入库管理|  |            数据展示区域              |   |
| - 出库管理|  |                                        |   |
| - 库存查询|  |                                        |   |
| - 报表中心|  +----------------------------------------+   |
| - 系统设置|                                             |
+----------------------------------------------------------+
|                    状态栏/操作提示区                      |
+----------------------------------------------------------+
```

#### 产品管理页面
- **列表视图**: 表格形式展示产品信息
- **卡片视图**: 卡片形式展示，适合移动端
- **详情弹窗**: 点击查看详细信息
- **快速操作**: 编辑、删除、查看历史等

#### 入库管理页面
- **向导式界面**: 分步骤引导入库操作
- **IMEI输入区**: 支持扫码和手动输入，集成IMEI唯一性检查
- **字段表单**: 入库相关所有字段的表单填写
- **状态管理**: 入库、退库、售后等状态管理
- **实时反馈**: 操作结果即时显示，包括IMEI重复提示
- **批量操作**: 支持批量选择和操作
- **单据上传区**: 支持拖拽上传和文件选择上传
- **表格导入区**: 支持Excel/CSV文件上传和数据预览
- **模板下载**: 提供标准化导入模板下载
- **数据验证**: 实时数据验证和错误提示
- **自动编号显示**: 系统自动生成的入库单号实时显示
- **单据管理**: 已上传单据的查看、下载、删除功能

#### 出库管理页面
- **订单查询**: 根据订单号查询相关产品
- **产品选择**: 支持扫码和手动选择
- **物流信息**: 收货信息、快递公司、快递单号
- **出库确认**: 双重确认机制
- **出库单生成**: 自动生成出库单区域
- **模板选择**: 支持选择不同的出库单模板
- **单据预览**: 生成后可预览出库单效果
- **下载打印**: 支持PDF下载和直接打印

### 5.2 移动端适配

#### 响应式设计要点
- **断点设置**: 
  - 桌面端: ≥1200px
  - 平板端: 768px-1199px  
  - 手机端: <768px

- **导航适配**: 移动端使用汉堡菜单
- **表格适配**: 移动端转换为卡片式布局
- **按钮优化**: 增大触摸目标，优化手势操作

## 6. API接口设计

### 6.1 RESTful API规范

#### 基础路径
```
Base URL: https://api.inventory-system.com/v1
```

#### 认证方式
```
Authorization: Bearer <JWT_TOKEN>
```

#### 核心API端点

#### 用户管理API
```
GET    /users                      # 获取用户列表
POST   /users                      # 创建新用户
GET    /users/{id}                 # 获取指定用户信息
PUT    /users/{id}                 # 更新用户信息
DELETE /users/{id}                 # 删除用户
```

#### 产品管理API
```
GET    /products                   # 获取产品列表
POST   /products                   # 创建新产品
GET    /products/{id}              # 获取指定产品信息
PUT    /products/{id}              # 更新产品信息
DELETE /products/{id}              # 删除产品
```

#### 供应商管理API
```
GET    /suppliers                  # 获取供应商列表
POST   /suppliers                  # 创建新供应商
GET    /suppliers/{id}             # 获取指定供应商信息
PUT    /suppliers/{id}             # 更新供应商信息
DELETE /suppliers/{id}             # 删除供应商
```

#### 业务人员管理API
```
GET    /business-staff             # 获取业务人员列表
POST   /business-staff             # 创建新业务人员
GET    /business-staff/{id}        # 获取指定业务人员信息
PUT    /business-staff/{id}        # 更新业务人员信息
DELETE /business-staff/{id}        # 删除业务人员
```

#### 库存管理API
```
GET    /inventory                  # 获取库存列表
GET    /inventory/{imei}           # 获取指定IMEI库存
PUT    /inventory/{imei}           # 更新库存信息
GET    /inventory/statistics       # 获取库存统计
POST   /inventory/stocktaking      # 执行盘点操作
```

#### 入库管理API
```
GET    /inbound                    # 获取入库记录
POST   /inbound                    # 创建入库记录
GET    /inbound/{id}               # 获取入库记录详情
PUT    /inbound/{id}               # 更新入库记录
POST   /inbound/batch              # 批量入库
POST   /inbound/import-excel       # Excel/CSV表格导入
GET    /inbound/import-template    # 下载导入模板
POST   /inbound/validate-import    # 验证导入数据
POST   /inbound/return             # 退库操作
POST   /inbound/generate-number    # 生成入库单号
POST   /inbound/validate-number    # 验证编号格式
GET    /inbound/number-preview     # 预览编号格式
GET    /inbound/number-config      # 获取编号配置
PUT    /inbound/number-config      # 更新编号配置
POST   /inbound/upload-document    # 上传入库单据
GET    /inbound/{id}/documents     # 获取入库单据列表
DELETE /inbound/document/{doc_id}  # 删除入库单据
GET    /inbound/document/{doc_id}/download # 下载单据文件
```

#### 退库管理API
```
GET    /returns                    # 获取退库记录
POST   /returns                    # 创建退库申请
GET    /returns/{id}               # 获取退库记录详情
PUT    /returns/{id}               # 更新退库信息
POST   /returns/{id}/approve       # 审核退库申请
POST   /returns/{id}/reject        # 拒绝退库申请
POST   /returns/{id}/execute       # 执行退库操作
POST   /returns/batch              # 批量退库
POST   /returns/{id}/generate-document # 生成退库单
GET    /returns/{id}/document      # 获取退库单PDF
POST   /returns/upload-evidence    # 上传退库凭证
```
```
GET    /outbound                   # 获取出库记录
POST   /outbound                   # 创建出库记录
GET    /outbound/{id}              # 获取出库记录详情
PUT    /outbound/{id}              # 更新出库记录
POST   /outbound/batch             # 批量出库
POST   /outbound/{id}/generate-document # 生成出库单
GET    /outbound/{id}/document     # 获取出库单PDF
GET    /outbound/templates         # 获取出库单模板列表
POST   /outbound/batch-generate    # 批量生成出库单
GET    /outbound/export/templates  # 获取导出模板列表
POST   /outbound/export/preview    # 预览导出数据
POST   /outbound/export/excel      # 导出Excel文件
POST   /outbound/export/csv        # 导出CSV文件
POST   /outbound/export/pdf        # 导出PDF文件
GET    /outbound/export/status/{id} # 查询导出状态
GET    /outbound/export/download/{id} # 下载导出文件
DELETE /outbound/export/cancel/{id} # 取消导出任务
GET    /outbound/export/history    # 获取导出历史
```

### 6.3 API响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "IMEI号格式不正确",
    "details": []
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## 7. 安全性设计

### 7.1 认证与授权
- **JWT Token**: 基于Token的身份认证
- **角色权限**: 基于角色的访问控制(RBAC)
- **会话管理**: Token过期和续签机制
- **单点登录**: 支持SSO集成

### 7.2 数据安全
- **数据加密**: 敏感数据加密存储
- **传输安全**: HTTPS协议传输
- **SQL注入防护**: 参数化查询
- **XSS防护**: 输入数据过滤和转义

### 7.3 操作安全
- **操作日志**: 记录所有关键操作
- **IP白名单**: 限制访问来源
- **频率限制**: API调用频率限制
- **数据备份**: 定期数据备份

## 8. 性能优化

### 8.1 数据库优化
- **索引策略**: 为IMEI、时间等字段建立索引
- **分表分库**: 大数据量时考虑水平分割
- **查询优化**: 避免N+1查询问题
- **连接池**: 数据库连接池配置

### 8.2 缓存策略
- **Redis缓存**: 热点数据缓存
- **页面缓存**: 静态页面缓存
- **API缓存**: 查询结果缓存
- **CDN加速**: 静态资源CDN分发

### 8.3 前端优化
- **代码分割**: 按需加载组件
- **图片优化**: 图片压缩和懒加载
- **打包优化**: Webpack优化配置
- **PWA支持**: 离线缓存支持

## 9. 测试策略

### 9.1 单元测试
- **前端测试**: Jest + React Testing Library
- **后端测试**: JUnit/Mocha + 测试数据库
- **覆盖率要求**: 代码覆盖率≥80%

### 9.2 集成测试
- **API测试**: Postman/Newman自动化测试
- **数据库测试**: 数据一致性测试
- **第三方集成**: 模拟外部服务测试

### 9.3 端到端测试
- **UI测试**: Cypress/Selenium自动化测试
- **业务流程**: 完整业务场景测试
- **兼容性测试**: 多浏览器兼容性测试
























