const express = require('express');
const cors = require('cors'); 
const app = express();

// 允许所有域名跨域请求（开发环境使用）
app.use(cors());
app.use(express.json());

// 挂载路由（原有代码不变）
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
app.use('/api', usersRouter);
app.use('/api', postsRouter);


// 新增：添加/api/test测试接口（写在这里）
app.get('/api/test', (req, res) => {
  res.send({
    code: 200,
    msg: "本地后端启动成功！后续可对接数据库"
  });
});


// 启动服务（修改端口配置）
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`✅ 服务已启动：http://localhost:${PORT}`);
});         