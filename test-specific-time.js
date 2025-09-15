// 测试时间格式化函数处理具体的时间
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

// 测试您提到的具体时间
const testTime = '2025-09-15 13:40:25';
console.log('测试时间:', testTime);
console.log('格式化结果:', formatToBeijingTime(testTime));

// 让我们看看dayjs是如何解析这个时间的
const parsedTime = dayjs(testTime);
console.log('解析后的时间:', parsedTime.format());
console.log('解析后的时区:', parsedTime.format('Z'));