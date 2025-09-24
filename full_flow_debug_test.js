// 完整流程调试测试：从前端服务层到后端的完整流程
const fs = require('fs');
const path = require('path');

async function runFullFlowDebugTest() {
  try {
    console.log('=== 完整流程调试测试 ===\n');
    
    // 1. 模拟前端服务层调用
    console.log('\n1. 模拟前端服务层调用...');
    
    // 模拟前端发送的数据
    const frontendStockInData = {
      product_name: '测试产品',
      product_model: '测试型号',
      imei: 'TEST' + Date.now(),
      stock_in_quantity: 1,
      supplier: '测试供应商',
      factory_order: 'TEST_ORDER',
      stock_in_date: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      stock_in_contract_number: 'TEST_CONTRACT',
      stock_in_document: '测试收货单据.xlsx',
      stock_in_notes: '测试备注'
    };
    
    console.log('  前端发送的数据:', JSON.stringify(frontendStockInData, null, 2));
    
    // 2. 模拟前端服务层处理
    console.log('\n2. 模拟前端服务层处理...');
    
    // 验证必填字段
    if (!frontendStockInData.product_name) {
      throw new Error('产品名称不能为空');
    }
    
    if (!frontendStockInData.stock_in_date) {
      throw new Error('入库时间不能为空');
    }
    
    if (!frontendStockInData.stock_in_quantity || frontendStockInData.stock_in_quantity <= 0) {
      throw new Error('入库数量必须为正整数');
    }
    
    // 添加收货单据信息到请求数据
    const requestData = {
      ...frontendStockInData,
      stock_in_document: frontendStockInData.stock_in_document || ''
    };
    
    console.log('  服务层处理后的数据:', JSON.stringify(requestData, null, 2));
    
    // 3. 模拟后端控制器处理
    console.log('\n3. 模拟后端控制器处理...');
    
    // 模拟请求对象
    const mockReq = {
      body: requestData,
      user: {
        username: '测试用户'
      }
    };
    
    console.log('  控制器接收到的数据:', JSON.stringify(mockReq.body, null, 2));
    
    // 控制器中的过滤逻辑
    const { stock_in_auto_number, ...filteredBody } = mockReq.body;
    
    const stockInData = {
      ...filteredBody,
      stock_in_by: mockReq.user ? mockReq.user.username : 'unknown'
    };
    
    console.log('  控制器过滤后的数据:', JSON.stringify(stockInData, null, 2));
    
    // 4. 模拟后端模型处理
    console.log('\n4. 模拟后端模型处理...');
    
    // 模拟 InventoryModel.createStockIn 方法的部分逻辑
    const {
      product_id, product_name, product_model, product_description, operator,
      imei, batch_number, stock_in_quantity = 1, supplier, factory_name,
      factory_order, stock_in_date, stock_in_contract_number, stock_in_document,
      stock_in_by, stock_in_notes, stock_in_number
    } = stockInData;

    // 处理入库日期
    let formatted_stock_in_date = stock_in_date;
    if (stock_in_date) {
      try {
        const date = new Date(stock_in_date);
        if (isNaN(date.getTime())) {
          formatted_stock_in_date = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        } else {
          formatted_stock_in_date = date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        }
      } catch (dateError) {
        formatted_stock_in_date = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      }
    } else {
      formatted_stock_in_date = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    }

    // 获取当前北京时间用于 stock_in_time 字段
    const beijingTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

    console.log('  处理后的入库日期:', formatted_stock_in_date);
    console.log('  当前北京时间 (stock_in_time):', beijingTime);
    
    // 准备SQL参数
    const params = [
      product_id, product_name, product_model, product_description, operator,
      imei, batch_number, stock_in_quantity, '已入库', '正常',
      '正常', '正常', supplier,
      factory_name, factory_order, formatted_stock_in_date, stock_in_contract_number,
      stock_in_document, stock_in_by, stock_in_notes, stock_in_quantity, 'in',
      stock_in_number || null,
      // 添加 stock_in_auto_number 字段，显式设置为 NULL
      null,
      // 添加 stock_in_time 字段，使用当前北京时间
      beijingTime,
      // 添加created_at字段，使用当前时间
      beijingTime
    ];
    
    console.log('  SQL参数:');
    console.log('    product_name:', params[1]);
    console.log('    stock_in_date:', params[15]);
    console.log('    stock_in_document:', params[17]);
    console.log('    stock_in_auto_number:', params[23]);
    console.log('    stock_in_time:', params[24]);
    console.log('    created_at:', params[25]);
    
    // 5. 直接调用后端模型
    console.log('\n5. 直接调用后端模型...');
    const InventoryModel = require('./backend/models/Inventory');
    
    const testResult = await InventoryModel.createStockIn(stockInData);
    console.log('  模型创建结果:', testResult);
    
    // 6. 检查数据库中的记录
    console.log('\n6. 检查数据库中的记录...');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./backend/data/inventory.db');
    
    // 查找最新插入的记录
    const getRecord = new Promise((resolve, reject) => {
      db.get('SELECT * FROM inventory ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    const row = await getRecord;
    console.log('  数据库记录:');
    console.log('    ID:', row.id);
    console.log('    IMEI:', row.imei);
    console.log('    stock_in_time:', row.stock_in_time === null ? 'NULL' : row.stock_in_time);
    console.log('    stock_in_auto_number:', row.stock_in_auto_number === null ? 'NULL' : row.stock_in_auto_number);
    console.log('    stock_in_document:', row.stock_in_document);
    console.log('    created_at:', row.created_at);
    
    // 清理测试数据
    console.log('\n7. 清理测试数据...');
    const deleteRecord = new Promise((resolve, reject) => {
      db.run('DELETE FROM inventory WHERE id = ?', [row.id], (deleteErr) => {
        if (deleteErr) {
          reject(deleteErr);
        } else {
          resolve();
        }
      });
    });
    
    await deleteRecord;
    console.log('  测试记录已清理');
    
    db.close();
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
runFullFlowDebugTest();