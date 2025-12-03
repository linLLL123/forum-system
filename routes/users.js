// 第一步：必须先引入express并创建路由实例
const express = require('express');
const router = express.Router(); // 这里定义router，之前漏写了
const db = require('../config/db');

// 注册接口
router.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.json({ code: 400, msg: '用户名、密码、邮箱均不能为空' });
  }

  const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  db.query(sql, [username, password, email], (err, result) => {
    if (err) {
      console.error('注册失败：', err);
      return res.json({ code: 500, msg: '注册失败' });
    }
    res.json({ code: 200, msg: '注册成功！', data: { user_id: result.insertId } });
  });
});

// 登录接口
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ code: 400, msg: '用户名和密码不能为空' });
  }

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('登录查询失败：', err);
      return res.json({ code: 500, msg: '登录失败' });
    }

    if (results.length === 0) {
      return res.json({ code: 401, msg: '用户名或密码错误' });
    }

    res.json({ 
      code: 200, 
      msg: '登录成功！', 
      data: { user_id: results[0].id, username: results[0].username } 
    });
  });
});

module.exports = router;