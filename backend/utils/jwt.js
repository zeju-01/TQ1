// JWT工具函数
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'iot_inventory_management_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// 调试：确保JWT_SECRET有值
if (!JWT_SECRET) {
  console.error('JWT_SECRET未配置，使用默认值');
}
console.log('JWT_SECRET已加载:', JWT_SECRET ? '✓' : '✗');

// 生成访问令牌
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    permission: user.permission,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'iot-inventory-system'
  });
};

// 生成刷新令牌
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'iot-inventory-system'
  });
};

// 验证令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('令牌已过期');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('无效的令牌');
    } else {
      throw new Error('令牌验证失败');
    }
  }
};

// 从请求头获取令牌
const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  // 支持两种格式: "Bearer token" 或 "token"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
};

// 检查令牌是否即将过期 (30分钟内)
const isTokenExpiringSoon = (decoded) => {
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - now;
  return timeUntilExpiry < 30 * 60; // 30分钟
};

// 生成令牌对 (访问令牌 + 刷新令牌)
const generateTokenPair = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: JWT_EXPIRES_IN
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  extractTokenFromHeader,
  isTokenExpiringSoon,
  generateTokenPair
};