const express = require('express');
const router = express.Router(); 
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

// 发帖接口（直接给category_id传默认值1）
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    // 手动给category_id传1，不用依赖数据库默认值
    await pool.query(
      'INSERT INTO posts (title, content, category_id, user_id) VALUES (?, ?, ?, ?)',
      [title, content, 1, req.userId] // 这里直接写1
    );
    res.json({ code: 200, msg: '发帖成功' });
  } catch (err) {
    console.error('发帖错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 获取帖子列表接口（前端展示所有帖子）
router.get('/posts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posts ORDER BY create_time DESC');
    res.json({ code: 200, msg: '获取成功', data: rows });
  } catch (err) {
    console.error('获取帖子列表错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 获取单篇帖子详情接口（前端点击帖子查看）
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (rows.length === 0) return res.json({ code: 404, msg: '帖子不存在' });
    res.json({ code: 200, msg: '获取成功', data: rows[0] });
  } catch (err) {
    console.error('获取帖子详情错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 删除帖子接口（仅帖子作者可删除）
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // 先查询帖子的作者ID，验证权限
    const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [id]);
    if (post.length === 0) return res.json({ code: 404, msg: '帖子不存在' });
    if (post[0].user_id !== req.userId) return res.json({ code: 403, msg: '无权限删除该帖子' });

    // 验证通过后删除帖子
    await pool.query('DELETE FROM posts WHERE id = ?', [id]);
    res.json({ code: 200, msg: '帖子删除成功' });
  } catch (err) {
    console.error('删除帖子错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 编辑帖子接口（仅作者可改）
router.put('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    // 权限校验
    const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [id]);
    if (post.length === 0) return res.json({ code: 404, msg: '帖子不存在' });
    if (post[0].user_id !== req.userId) return res.json({ code: 403, msg: '无权限编辑' });

    // 更新帖子
    await pool.query(
      'UPDATE posts SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );
    res.json({ code: 200, msg: '帖子编辑成功' });
  } catch (err) {
    console.error('编辑帖子错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;