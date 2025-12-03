const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

dotenv.config();
const app = express();

// 跨域配置（允许前端访问）
app.use(cors());
// 解析JSON请求
app.use(express.json());

// 连接数据库
db.connect((err) => {
  if (err) throw err;
  console.log('✅ 数据库连接成功！');
});

// 导入所有接口（和routes文件夹对应）
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/apply', require('./routes/apply'));

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 后端运行在 http://localhost:${PORT}`);
});