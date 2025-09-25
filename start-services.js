const { spawn } = require('child_process');
const path = require('path');

console.log('正在启动互联网模组出入库管理系统...');

// 启动后端服务
console.log('正在启动后端服务...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

backend.on('close', (code) => {
  console.log(`后端服务退出，退出码 ${code}`);
});

backend.on('error', (error) => {
  console.error('启动后端服务时出错:', error);
});

// 启动前端服务
console.log('正在启动前端服务...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit'
});

frontend.on('close', (code) => {
  console.log(`前端服务退出，退出码 ${code}`);
});

frontend.on('error', (error) => {
  console.error('启动前端服务时出错:', error);
});

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n正在关闭所有服务...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在关闭所有服务...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});