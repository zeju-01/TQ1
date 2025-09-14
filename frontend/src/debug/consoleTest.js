// 在浏览器控制台中运行此脚本来测试删除功能
// 复制粘贴到浏览器控制台执行

async function testSupplierDelete() {
    console.log('=== 供应商删除功能测试 ===');
    
    // 1. 获取当前供应商列表
    try {
        const listResponse = await fetch('/api/suppliers', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        const listData = await listResponse.json();
        console.log('1. 当前供应商列表:', listData);
        
        if (listData.data && listData.data.length > 0) {
            const testSupplierId = listData.data[listData.data.length - 1].id;
            console.log('2. 将要删除的供应商ID:', testSupplierId);
            
            // 2. 尝试删除
            const deleteResponse = await fetch(`/api/suppliers/${testSupplierId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            
            console.log('3. 删除请求状态码:', deleteResponse.status);
            console.log('4. 删除请求是否成功:', deleteResponse.ok);
            
            const deleteData = await deleteResponse.json();
            console.log('5. 删除响应数据:', deleteData);
            
            if (deleteResponse.ok) {
                console.log('✅ 删除请求成功');
                
                // 3. 再次获取列表确认删除
                const newListResponse = await fetch('/api/suppliers', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                const newListData = await newListResponse.json();
                console.log('6. 删除后的供应商列表:', newListData);
                
                const stillExists = newListData.data.find(s => s.id === testSupplierId);
                if (!stillExists) {
                    console.log('✅ 数据确实被删除了');
                } else {
                    console.log('❌ 数据仍然存在');
                }
            } else {
                console.log('❌ 删除请求失败');
                console.log('错误详情:', deleteData);
            }
        } else {
            console.log('❌ 没有可删除的供应商');
        }
        
    } catch (error) {
        console.log('❌ 测试过程中发生错误:', error);
    }
}

// 测试API拦截器是否影响删除
async function testApiInterceptor() {
    console.log('\n=== API拦截器测试 ===');
    
    // 导入axios（如果在React应用中）
    try {
        // 模拟一个删除请求
        const response = await window.axios.delete('/api/suppliers/999999');
        console.log('拦截器测试 - 响应:', response);
    } catch (error) {
        console.log('拦截器测试 - 错误:', error);
        console.log('错误响应:', error.response);
        console.log('错误状态码:', error.response?.status);
        console.log('错误数据:', error.response?.data);
    }
}

// 执行测试
console.log('开始执行删除功能测试...');
testSupplierDelete().then(() => {
    console.log('删除功能测试完成');
});