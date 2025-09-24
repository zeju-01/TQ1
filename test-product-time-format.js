// 测试产品创建时间格式化
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// 扩展dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 设置dayjs为中文
dayjs.locale('zh-cn');

/**
 * 将时间转换为北京时间显示
 * @param time 时间字符串（可以是任何格式，函数会自动识别）
 * @returns 北京时间格式化字符串
 */
const formatToBeijingTime = (time) => {
  if (!time) return '';
  
  try {
    // 检查时间是否已经包含时区信息
    if (time.includes('Z') || time.includes('+') || time.includes('-') && time.split('-').length > 3) {
      // 如果包含时区信息，则按UTC时间处理并转换为北京时间
      const beijingTime = dayjs(time).tz('Asia/Shanghai');
      return beijingTime.format('YYYY-MM-DD HH:mm:ss');
    } else {
      // 如果不包含时区信息，则假定已经是北京时间，直接格式化
      const beijingTime = dayjs(time);
      return beijingTime.format('YYYY-MM-DD HH:mm:ss');
    }
  } catch (error) {
    console.error('时间格式化错误:', error);
    return time; // 如果格式化失败，返回原始时间字符串
  }
};

// 测试产品表中的时间格式
const productTimes = [
  '2025-09-14 15:06:52',  // 产品表中的格式
  '2025-09-14T15:06:52',  // ISO格式
  '2025-09-14T07:06:52Z', // UTC格式
];

console.log('产品创建时间格式化测试:');
productTimes.forEach(time => {
  try {
    const formatted = formatToBeijingTime(time);
    console.log(`${time} => ${formatted}`);
  } catch (error) {
    console.log(`${time} => 错误: ${error.message}`);
  }
});