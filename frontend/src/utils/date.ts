// 日期时间处理工具函数
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

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
export const formatToBeijingTime = (time: string): string => {
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

/**
 * 将时间转换为相对时间显示（如：2小时前，3天前等）
 * @param time 时间字符串
 * @returns 相对时间格式化字符串
 */
export const formatRelativeTime = (time: string): string => {
  if (!time) return '';
  
  try {
    const date = dayjs(time);
    const now = dayjs();
    const diffMinutes = now.diff(date, 'minute');
    const diffHours = now.diff(date, 'hour');
    const diffDays = now.diff(date, 'day');
    
    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 30) {
      return `${diffDays}天前`;
    } else {
      return date.format('YYYY-MM-DD');
    }
  } catch (error) {
    console.error('相对时间格式化错误:', error);
    return time;
  }
};

/**
 * 格式化日期为年月日
 * @param date 日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string): string => {
  if (!date) return '';
  
  try {
    return dayjs(date).format('YYYY-MM-DD');
  } catch (error) {
    console.error('日期格式化错误:', error);
    return date;
  }
};

/**
 * 格式化时间为时分秒
 * @param time 时间字符串
 * @returns 格式化后的时间字符串
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  
  try {
    return dayjs(time).format('HH:mm:ss');
  } catch (error) {
    console.error('时间格式化错误:', error);
    return time;
  }
};

/**
 * 获取当前北京时间
 * @returns 当前北京时间字符串
 */
export const getCurrentBeijingTime = (): string => {
  return dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
};