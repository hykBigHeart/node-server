const jwt = require('jsonwebtoken');
const SECRET_KEY = 'my-secret-key'; // 加密用的密钥

// 鉴权中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '请提供合法的 Token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token 无效或已过期' });
  }
}

module.exports = {
  authMiddleware
}