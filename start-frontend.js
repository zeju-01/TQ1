const { spawn } = require('child_process');
const path = require('path');

// 启动前端服务
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