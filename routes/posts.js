const express = require('express');
const router = express.Router(); // 必须创建express.Router实例
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Token验证中间件
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.json({ code: 401, msg: '未携带Token' });

  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.json({ code: 401, msg: 'Token无效' });
  }
};

// 发帖接口
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, category_id } = req.body;
    await pool.query('INSERT INTO posts (title, content, category_id, user_id) VALUES (?, ?, ?, ?)', [title, content, category_id, req.userId]);
    res.json({ code: 200, msg: '发帖成功' });
  } catch (err) {
    console.error('发帖错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router; // 必须导出router实例