const { spawn } = require('child_process');
const path = require('path');

// 启动后端服务
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