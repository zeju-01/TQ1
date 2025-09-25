// 时间处理工具函数

/**
 * 获取当前北京时间
 * @returns {string} 格式为 YYYY-MM-DD HH:MM:SS 的北京时间字符串
 */
function getBeijingTime() {
  const now = new Date();
  // 使用Intl.DateTimeFormat来正确处理时区
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const datePart = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
  const timePart = `${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value}:${parts.find(p => p.type === 'second').value}`;
  
  return `${datePart} ${timePart}`;
}

/**
 * 获取当前北京日期
 * @returns {string} 格式为 YYYY-MM-DD 的北京日期字符串
 */
function getBeijingDate() {
  const now = new Date();
  // 使用Intl.DateTimeFormat来正确处理时区
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const parts = formatter.formatToParts(now);
  return `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
}

/**
 * 格式化时间为 YYYY-MM-DD 格式
 * @param {string|Date} dateInput - 输入的日期
 * @returns {string} 格式化后的日期字符串
 */
function formatToDateString(dateInput) {
  if (!dateInput) {
    return getBeijingDate();
  }
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return getBeijingDate();
    }
    
    // 使用Intl.DateTimeFormat来正确处理时区
    const formatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const parts = formatter.formatToParts(date);
    return `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
  } catch (error) {
    return getBeijingDate();
  }
}

/**
 * 智能解析时间字符串
 * @param {string} timeString - 时间字符串
 * @returns {string} 格式为 YYYY-MM-DD HH:MM:SS 的时间字符串
 */
function parseTimeString(timeString) {
  if (!timeString) {
    return getBeijingTime();
  }
  
  try {
    // 如果时间字符串包含时区信息，按UTC时间处理并转换为北京时间
    if (timeString.includes('Z') || timeString.includes('+') || timeString.includes('-')) {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return getBeijingTime();
      }
      
      // 使用Intl.DateTimeFormat来正确处理时区
      const formatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(date);
      const datePart = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
      const timePart = `${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value}:${parts.find(p => p.type === 'second').value}`;
      
      return `${datePart} ${timePart}`;
    } else {
      // 如果时间字符串不包含时区信息，假定已经是北京时间
      return timeString;
    }
  } catch (error) {
    return getBeijingTime();
  }
}

module.exports = {
  getBeijingTime,
  getBeijingDate,
  formatToDateString,
  parseTimeString
};