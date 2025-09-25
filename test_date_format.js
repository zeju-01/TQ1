// 测试日期格式化
console.log('测试日期格式化:');

// 获取当前北京时间
const now = new Date();
const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
console.log('当前北京时间:', beijingTime.toISOString());
console.log('日期部分(UTC):', now.toISOString().split('T')[0]);
console.log('日期部分(北京时间):', beijingTime.toISOString().split('T')[0]);

// 测试不同的时间处理方式
console.log('\n不同时间处理方式对比:');
console.log('1. 直接使用toISOString().split("T")[0]:', now.toISOString().split('T')[0]);
console.log('2. 使用北京时间toISOString().split("T")[0]:', beijingTime.toISOString().split('T')[0]);

// 检查是否需要调整日期
const utcDate = now.toISOString().split('T')[0];
const beijingDate = beijingTime.toISOString().split('T')[0];
console.log('\n日期差异:');
console.log('UTC日期:', utcDate);
console.log('北京时间日期:', beijingDate);
console.log('是否相同:', utcDate === beijingDate);