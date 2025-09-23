const fs = require('fs');
const path = require('path');

// 模拟完整的入库流程测试
async function testFullStockInProcess() {
  try {
    console.log('开始测试完整的入库流程...');
    
    // 1. 登录获取访问令牌
    console.log('1. 登录获取访问令牌...');
    const loginResponse = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
      console.log('登录失败:', loginResult.message);
      return;
    }

    const accessToken = loginResult.data.accessToken;
    console.log('✅ 登录成功，获取到访问令牌');

    // 2. 创建一个测试PDF文件
    console.log('2. 创建测试PDF文件...');
    const testContent = '%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n/Resources <<\n/ProcSet [/PDF /Text]\n/Font <<\n/F1 5 0 R\n>>\n>>\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(测试收货单据文件) Tj\nET\nendstream\nendobj\n5 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000015 00000 n \n0000000060 00000 n \n0000000111 00000 n \n0000000231 00000 n \n0000000325 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n385\n%%EOF';
    const testFileName = '测试收货单据.pdf';
    const testFilePath = path.join(__dirname, testFileName);
    
    fs.writeFileSync(testFilePath, testContent, 'binary');
    console.log('✅ 测试PDF文件创建成功');

    // 3. 上传文件
    console.log('3. 上传文件...');
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('files', fileBlob, testFileName);

    const uploadResponse = await fetch('http://localhost:5002/api/upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const uploadResult = await uploadResponse.json();
    console.log('上传响应:', uploadResult);
    
    if (!uploadResult.success) {
      console.log('❌ 文件上传失败:', uploadResult.message);
      return;
    }
    
    const uploadedFileName = uploadResult.data[0].filename;
    console.log('✅ 文件上传成功，文件名:', uploadedFileName);

    // 4. 执行入库操作
    console.log('4. 执行入库操作...');
    const stockInData = {
      product_name: "测试产品",
      product_model: "TM001",
      operator: "测试运营商",
      imei: "123456789012352",
      stock_in_quantity: 1,
      supplier: "测试供应商",
      stock_in_date: new Date().toISOString(),
      stock_in_document: uploadedFileName // 使用上传后的文件名
    };

    console.log('入库数据:', stockInData);

    const stockInResponse = await fetch('http://localhost:5002/api/inventory/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(stockInData)
    });

    const stockInResult = await stockInResponse.json();
    console.log('入库响应:', stockInResult);

    if (stockInResult.success) {
      console.log('✅ 入库成功');
      console.log('入库记录ID:', stockInResult.data.id);
      
      // 5. 验证数据库中的 stock_in_document 字段
      console.log('5. 验证数据库中的 stock_in_document 字段...');
      const verifyResponse = await fetch(`http://localhost:5002/api/inventory/${stockInResult.data.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.success && verifyResult.data.stock_in_document === uploadedFileName) {
        console.log('✅ stock_in_document 字段保存成功:', verifyResult.data.stock_in_document);
        console.log('🎉 完整的入库流程测试成功！');
      } else {
        console.log('❌ stock_in_document 字段保存失败');
        console.log('期望值:', uploadedFileName);
        console.log('实际值:', verifyResult.data.stock_in_document);
      }
    } else {
      console.log('❌ 入库失败:', stockInResult.message);
    }
    
    // 清理测试文件
    fs.unlinkSync(testFilePath);
    console.log('✅ 测试文件已清理');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testFullStockInProcess();