const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// 1. 报名项目（需登录）
router.post('/', auth, (req, res) => {
  const { project_id, apply_role, apply_msg } = req.body; // 项目ID改为 project_id
  const user_id = req.userId;

  if (!project_id || !apply_role) {
    return res.json({ code: 400, msg: '项目ID和报名角色不能为空！' });
  }

  // 检查是否已报名（关联项目表 projects）
  db.query(
    'SELECT * FROM applications WHERE project_id = ? AND user_id = ?',
    [project_id, user_id],
    (err, results) => {
      if (err) {
        console.error('查询报名记录失败：', err);
        return res.json({ code: 500, msg: '服务器错误' });
      }
      if (results.length > 0) {
        return res.json({ code: 400, msg: '你已报名该项目，无需重复提交！' });
      }

      // 新增报名记录（关联项目表ID为 project_id）
      db.query(
        'INSERT INTO applications (project_id, user_id, apply_role, apply_msg) VALUES (?, ?, ?, ?)',
        [project_id, user_id, apply_role, apply_msg || ''],
        (err) => {
          if (err) {
            console.error('新增报名记录失败：', err);
            return res.json({ code: 500, msg: '服务器错误' });
          }
          res.json({ code: 200, msg: '报名成功！等待项目发起人回复~' });
        }
      );
    }
  );
});

// 2. 查看项目报名记录（仅项目发起人）
router.get('/:project_id', auth, (req, res) => {
  const { project_id } = req.params; // 项目ID
  const user_id = req.userId;

  // 验证当前用户是否是项目发起人（关联 projects 表）
  db.query(
    'SELECT * FROM projects WHERE id = ? AND creator_id = ?',
    [project_id, user_id],
    (err, projResults) => {
      if (err) {
        console.error('验证项目发起人失败：', err);
        return res.json({ code: 500, msg: '服务器错误' });
      }
      if (projResults.length === 0) {
        return res.json({ code: 403, msg: '无权限查看该项目的报名记录！' });
      }

      // 查询该项目的所有报名记录
      db.query(
        'SELECT a.*, u.username, u.email FROM applications a JOIN users u ON a.user_id = u.id WHERE a.project_id = ?',
        [project_id],
        (err, applyResults) => {
          if (err) {
            console.error('查询报名记录失败：', err);
            return res.json({ code: 500, msg: '服务器错误' });
          }
          res.json({ code: 200, data: applyResults });
        }
      );
    }
  );
});

module.exports = router;