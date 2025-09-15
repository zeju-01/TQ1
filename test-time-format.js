// 测试时间格式化函数
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// 扩展dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 将UTC时间转换为北京时间显示
 * @param utcTime UTC时间字符串
 * @returns 北京时间格式化字符串
 */
const formatToBeijingTime = (utcTime) => {
  if (!utcTime) return '';
  
  try {
    // 使用dayjs解析UTC时间并转换为北京时间
    const beijingTime = dayjs(utcTime).tz('Asia/Shanghai');
    return beijingTime.format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    console.error('时间格式化错误:', error);
    return utcTime; // 如果格式化失败，返回原始时间字符串
  }
};

// 测试不同的时间格式
const testTimes = [
  '2025-09-15 04:34:42',  // 数据库中的格式
  '2025-09-15T04:34:42',  // ISO格式
  '2025-09-15T04:34:42Z', // UTC格式
  '2025-09-15T04:34:42+08:00', // 带时区信息
  'invalid-time'  // 无效时间
];

console.log('时间格式化测试:');
testTimes.forEach(time => {
  try {
    const formatted = formatToBeijingTime(time);
    console.log(`${time} => ${formatted}`);
  } catch (error) {
    console.log(`${time} => 错误: ${error.message}`);
  }
});