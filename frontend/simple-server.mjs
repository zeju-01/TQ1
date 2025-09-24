import http from 'http';
import fs from 'fs';
import path from 'path';

// 明确指定前端目录作为根目录
const rootDir = 'D:\\python_work\\QOD\\TQ1\\frontend';

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  let filePath = req.url;
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  // 移除查询参数
  if (filePath.includes('?')) {
    filePath = filePath.split('?')[0];
  }
  
  // 确保文件路径以 '/' 开头
  if (!filePath.startsWith('/')) {
    filePath = '/' + filePath;
  }
  
  // 构建完整的文件路径
  const fullPath = path.join(rootDir, filePath.substring(1));
  console.log(`Serving file: ${fullPath}`);
  
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log('File not found:', fullPath);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        console.log('Server error:', err);
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      console.log('File served successfully');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Simple server running on http://localhost:${PORT}/`);
  console.log(`Root directory: ${rootDir}`);
});