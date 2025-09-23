// 在后端控制器中添加更详细的日志记录
const fs = require('fs');
const path = require('path');

// 创建日志目录
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志记录函数
function logRequest(label, data) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${label}: ${JSON.stringify(data, null, 2)}\n`;
  const logFile = path.join(logDir, 'request_debug.log');
  
  fs.appendFileSync(logFile, logEntry);
  console.log(`${label}:`, data);
}

module.exports = { logRequest };