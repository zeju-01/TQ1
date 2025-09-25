// 简单时间处理测试
const timeUtils = require('./utils/timeUtils');

console.log('=== 简单时间处理测试 ===');

// 模拟用户反馈的问题场景
const problemTimeUTC = '2025-09-25T05:52:31Z'; // UTC时间
const expectedBeijingTime = '2025-09-25 13:52:31'; // 期望的北京时间（UTC+8）

console.log('问题场景:');
console.log('UTC时间:', problemTimeUTC);
console.log('期望北京时间:', expectedBeijingTime);

// 使用工具函数处理
const parsedTime = timeUtils.parseTimeString(problemTimeUTC);
console.log('工具函数处理结果:', parsedTime);

// 检查是否正确
if (parsedTime === expectedBeijingTime) {
  console.log('✅ 时间处理正确');
} else {
  console.log('❌ 时间处理错误');
  console.log('差异:', parsedTime, 'vs', expectedBeijingTime);
}

// 测试当前时间
console.log('\n当前时间测试:');
const currentTime = timeUtils.getBeijingTime();
console.log('当前北京时间:', currentTime);

// 验证时间格式
const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
if (timeRegex.test(currentTime)) {
  console.log('✅ 时间格式正确');
} else {
  console.log('❌ 时间格式错误');
}

console.log('\n=== 测试完成 ===');