const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth'); // 登录校验

// 1. 发布项目（需登录）
router.post('/', auth, (req, res) => {
  const { title, description } = req.body;
  const creator_id = req.userId; // 从登录信息获取发布人ID

  if (!title) {
    return res.json({ code: 400, msg: '项目标题不能为空！' });
  }

  // 插入项目表（表名已改为 projects）
  db.query(
    'INSERT INTO projects (title, description, creator_id) VALUES (?, ?, ?)',
    [title, description || '', creator_id],
    (err, result) => {
      if (err) {
        console.error('发布项目失败：', err);
        return res.json({ code: 500, msg: '服务器错误' });
      }
      res.json({ 
        code: 200, 
        msg: '项目发布成功！',
        data: { project_id: result.insertId } // 返回新发布的项目ID
      });
    }
  );
});

// 2. 查看所有项目列表
router.get('/', (req, res) => {
  // 查询项目表（表名已改为 projects），关联用户表显示发布人用户名
  db.query(
    'SELECT p.*, u.username FROM projects p JOIN users u ON p.creator_id = u.id ORDER BY p.created_at DESC',
    (err, results) => {
      if (err) {
        console.error('查询项目列表失败：', err);
        return res.json({ code: 500, msg: '服务器错误' });
      }
      res.json({ code: 200, data: results });
    }
  );
});

// 3. 查看单个项目详情（通过项目ID）
router.get('/:id', (req, res) => {
  const { id } = req.params; // 项目ID

  db.query(
    'SELECT p.*, u.username FROM projects p JOIN users u ON p.creator_id = u.id WHERE p.id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error('查询项目详情失败：', err);
        return res.json({ code: 500, msg: '服务器错误' });
      }
      if (results.length === 0) {
        return res.json({ code: 404, msg: '项目不存在！' });
      }
      res.json({ code: 200, data: results[0] });
    }
  );
});

module.exports = router;