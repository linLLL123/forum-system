const express = require('express');
const router = express.Router(); // 必须创建express.Router实例
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 注册接口
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const [exist] = await pool.query('SELECT * FROM users WHERE username=? OR email=?', [username, email]);
    if (exist.length > 0) return res.json({ code: 400, msg: '用户名/邮箱已存在' });

    const hashPwd = bcrypt.hashSync(password, 10);
    await pool.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashPwd, email]);
    res.json({ code: 200, msg: '注册成功' });
  } catch (err) {
    console.error('注册错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query('SELECT id, password FROM users WHERE username=?', [username]);
    if (users.length === 0) return res.json({ code: 400, msg: '用户名不存在' });

    const isMatch = bcrypt.compareSync(password, users[0].password);
    if (!isMatch) return res.json({ code: 400, msg: '密码错误' });

    const token = jwt.sign({ userId: users[0].id }, 'secret_key', { expiresIn: '24h' });
    res.json({ code: 200, msg: '登录成功', data: { token } });
  } catch (err) {
    console.error('登录错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router; // 必须导出router实例