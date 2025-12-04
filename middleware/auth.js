// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      code: 401,
      msg: '请先登录！'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 401,
      msg: '登录已过期，请重新登录'
    });
  }
};

module.exports = authMiddleware;