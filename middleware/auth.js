const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.json({ code: 401, msg: '请先登录！' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.json({ code: 401, msg: '登录过期啦！' });
    req.userId = decoded.id;
    next();
  });
};