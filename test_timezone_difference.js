// 测试时区差异
console.log('测试时区差异:');

// 模拟UTC时间是昨天晚上23:00的情况
const utcTime = new Date('2025-09-25T23:00:00Z');
console.log('UTC时间:', utcTime.toISOString());

// 转换为北京时间（UTC+8）
const beijingTime = new Date(utcTime.getTime() + 8 * 60 * 60 * 1000);
console.log('北京时间:', beijingTime.toISOString());

console.log('\n日期部分对比:');
console.log('UTC日期:', utcTime.toISOString().split('T')[0]);
console.log('北京时间日期:', beijingTime.toISOString().split('T')[0]);

// 测试另一种情况：UTC时间是今天早上1:00
const utcTime2 = new Date('2025-09-25T01:00:00Z');
console.log('\n\n另一种情况:');
console.log('UTC时间:', utcTime2.toISOString());

// 转换为北京时间（UTC+8）
const beijingTime2 = new Date(utcTime2.getTime() + 8 * 60 * 60 * 1000);
console.log('北京时间:', beijingTime2.toISOString());

console.log('\n日期部分对比:');
console.log('UTC日期:', utcTime2.toISOString().split('T')[0]);
console.log('北京时间日期:', beijingTime2.toISOString().split('T')[0]);