// 权限检查脚本 - 在浏览器控制台运行

function checkUserPermissions() {
    console.log('=== 用户权限检查 ===');
    
    // 检查localStorage中的用户信息
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userInfo = localStorage.getItem('auth-storage');
    
    console.log('AccessToken:', accessToken ? `存在，长度: ${accessToken.length}` : '不存在');
    console.log('RefreshToken:', refreshToken ? `存在，长度: ${refreshToken.length}` : '不存在');
    
    if (userInfo) {
        try {
            const authData = JSON.parse(userInfo);
            console.log('用户认证信息:', authData);
            
            if (authData.state && authData.state.user) {
                const user = authData.state.user;
                console.log('用户信息:');
                console.log('- 用户名:', user.username);
                console.log('- 角色:', user.role);
                console.log('- 是否认证:', authData.state.isAuthenticated);
                
                // 检查是否有operator权限
                const hasOperatorPermission = ['admin', 'operator'].includes(user.role);
                console.log('- 是否有删除权限:', hasOperatorPermission ? '是' : '否');
                
                if (!hasOperatorPermission) {
                    console.log('❌ 用户角色不足，无法执行删除操作');
                    console.log('需要的角色: admin 或 operator');
                    console.log('当前角色:', user.role);
                }
            }
        } catch (e) {
            console.log('解析用户信息失败:', e);
        }
    } else {
        console.log('❌ 未找到用户认证信息');
    }
    
    // 尝试解析JWT token
    if (accessToken) {
        try {
            const parts = accessToken.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                console.log('JWT Token信息:');
                console.log('- 用户ID:', payload.userId);
                console.log('- 用户名:', payload.username);
                console.log('- 角色:', payload.role);
                console.log('- 过期时间:', new Date(payload.exp * 1000));
                
                const isExpired = Date.now() > payload.exp * 1000;
                console.log('- 是否过期:', isExpired ? '是' : '否');
                
                if (isExpired) {
                    console.log('❌ Token已过期，需要重新登录');
                }
            }
        } catch (e) {
            console.log('解析JWT Token失败:', e);
        }
    }
}

// 测试API权限
async function testApiPermissions() {
    console.log('\n=== API权限测试 ===');
    
    try {
        // 测试获取供应商列表（不需要特殊权限）
        const listResponse = await fetch('/api/suppliers');
        console.log('获取列表权限:', listResponse.status === 200 ? '✅ 成功' : `❌ 失败 (${listResponse.status})`);
        
        // 测试删除操作权限（需要认证和operator权限）
        const testId = 999999; // 使用不存在的ID测试权限而不实际删除数据
        const deleteResponse = await fetch(`/api/suppliers/${testId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        
        console.log('删除操作权限测试:');
        console.log('- 状态码:', deleteResponse.status);
        
        if (deleteResponse.status === 401) {
            console.log('❌ 401 - 认证失败，token无效或过期');
        } else if (deleteResponse.status === 403) {
            console.log('❌ 403 - 权限不足，用户角色不是operator或admin');
        } else if (deleteResponse.status === 404) {
            console.log('✅ 404 - 权限验证通过，但记录不存在（正常）');
        } else {
            console.log(`❓ ${deleteResponse.status} - 其他状态码`);
        }
        
        const deleteData = await deleteResponse.json();
        console.log('- 响应数据:', deleteData);
        
    } catch (error) {
        console.log('API测试失败:', error);
    }
}

// 执行检查
checkUserPermissions();
testApiPermissions();