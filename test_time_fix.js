const { getBeijingTime } = require('./backend/utils/timeUtils');

console.log('测试时间处理函数:');
console.log('北京时间:', getBeijingTime());

// 模拟用户遇到的问题场景
const utcTime = new Date('2025-09-25T05:52:31Z');
console.log('\n问题场景验证:');
console.log('UTC时间:', utcTime.toISOString());

// 使用我们的工具函数处理
const { parseTimeString } = require('./backend/utils/timeUtils');
console.log('工具函数处理后:', parseTimeString(utcTime.toISOString()));

// 手动计算正确的北京时间
const manualBeijing = new Date(utcTime.getTime() + 8 * 60 * 60 * 1000);
console.log('手动计算北京时间:', manualBeijing.getFullYear() + '-' + 
      String(manualBeijing.getMonth() + 1).padStart(2, '0') + '-' + 
      String(manualBeijing.getDate()).padStart(2, '0') + ' ' +
      String(manualBeijing.getHours()).padStart(2, '0') + ':' +
      String(manualBeijing.getMinutes()).padStart(2, '0') + ':' +
      String(manualBeijing.getSeconds()).padStart(2, '0'));