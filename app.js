const express = require('express');
const cors = require('cors'); // 引入cors
const app = express();

// 允许所有域名跨域请求（开发环境使用）
app.use(cors());
app.use(express.json());

// 挂载路由（原有代码不变）
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
app.use('/api', usersRouter);
app.use('/api', postsRouter);

// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ 服务已启动：http://localhost:${PORT}`);
});