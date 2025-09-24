# 部署指南

## 生产环境部署

### 1. 服务器要求

**最低配置**
- CPU: 2核
- 内存: 4GB
- 存储: 50GB SSD
- 操作系统: Ubuntu 20.04 LTS / CentOS 8

**推荐配置**
- CPU: 4核
- 内存: 8GB
- 存储: 100GB SSD
- 操作系统: Ubuntu 22.04 LTS

### 2. 环境安装

#### 安装 Node.js
```bash
# 使用 NodeSource 仓库安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 安装 MySQL
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### 安装 Nginx
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 安装 PM2
```bash
sudo npm install -g pm2
```

### 3. 应用部署

#### 部署后端

1. 克隆代码
```bash
git clone <repository-url>
cd iot-inventory-system/backend
```

2. 安装依赖
```bash
npm install --production
```

3. 配置环境变量
```bash
cp .env.example .env
nano .env
```

配置内容示例：
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=inventory_user
DB_PASSWORD=your_secure_password
DB_NAME=iot_inventory_management
JWT_SECRET=your_jwt_secret_key_here
```

4. 初始化数据库
```bash
mysql -u root -p < ../database/init.sql
mysql -u root -p < ../database/seed.sql
```

5. 使用 PM2 启动应用
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 部署前端

1. 构建前端应用
```bash
cd ../frontend
npm install
npm run build
```

2. 配置 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /var/www/iot-inventory/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 文件上传
    location /uploads {
        alias /var/www/iot-inventory/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. 部署静态文件
```bash
sudo mkdir -p /var/www/iot-inventory
sudo cp -r dist/* /var/www/iot-inventory/frontend/
sudo chown -R www-data:www-data /var/www/iot-inventory
```

4. 重启 Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL 配置

使用 Let's Encrypt 免费证书：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 5. 防火墙配置

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## Docker 部署

### 1. 后端 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. 前端 Dockerfile

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

### 3. Docker Compose

```yaml
version: '3.8'

services:
  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: iot_inventory_management
      MYSQL_USER: inventory_user
      MYSQL_PASSWORD: userpassword
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"

  backend:
    build: 
      context: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: database
      DB_USER: inventory_user
      DB_PASSWORD: userpassword
      DB_NAME: iot_inventory_management
    depends_on:
      - database
    ports:
      - "3000:3000"
    volumes:
      - uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
  uploads:
```

## 监控与维护

### 1. 系统监控

#### PM2 监控
```bash
pm2 monit
pm2 logs
pm2 status
```

#### 系统资源监控
```bash
# 安装 htop
sudo apt install htop

# 查看系统资源
htop
df -h
free -h
```

### 2. 日志管理

#### 配置日志轮转
```bash
sudo nano /etc/logrotate.d/iot-inventory
```

```
/var/log/iot-inventory/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reload ecosystem.config.js
    endscript
}
```

### 3. 数据库备份

#### 创建备份脚本
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="iot_inventory_management"

mkdir -p $BACKUP_DIR

mysqldump -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 保留最近7天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

#### 设置定时备份
```bash
crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup-script.sh
```

### 4. 安全加固

#### 防火墙配置
```bash
# 只开放必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### 定期更新
```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# Node.js 依赖更新
npm audit fix
```

## 故障排查

### 1. 常见问题

#### 数据库连接失败
- 检查数据库服务状态
- 验证连接配置
- 查看防火墙设置

#### 应用启动失败
- 查看 PM2 日志
- 检查端口占用
- 验证环境变量

#### 文件上传失败
- 检查上传目录权限
- 验证文件大小限制
- 查看 Nginx 配置

### 2. 性能优化

#### 数据库优化
- 定期优化表
- 监控慢查询
- 调整缓存设置

#### 应用优化
- 启用 gzip 压缩
- 配置静态资源缓存
- 优化数据库查询

## 升级指南

### 1. 准备工作
- 备份数据库
- 备份应用文件
- 准备回滚方案

### 2. 升级步骤
1. 停止应用服务
2. 更新代码
3. 安装新依赖
4. 运行数据库迁移
5. 启动应用服务
6. 验证功能正常

### 3. 回滚方案
如果升级出现问题，按以下步骤回滚：
1. 停止新版本应用
2. 恢复旧版本代码
3. 恢复数据库备份
4. 启动旧版本应用