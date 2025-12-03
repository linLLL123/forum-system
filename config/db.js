const mysql = require('mysql2');

// 创建长连接（不会自动关闭）
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'forum_user',
  password: process.env.DB_PWD || '123456',
  database: process.env.DB_NAME || 'forum_db',
  // 关键配置：保持连接活跃
  keepAlive: true,
  keepAliveInitialDelay: 300000 // 5分钟发送一次心跳包
});

// 连接数据库并监听错误
db.connect((err) => {
  if (err) {
    console.error('数据库连接失败：', err);
    return;
  }
  console.log('✅ 数据库连接成功！');
});

// 监听连接断开，自动重连
db.on('error', (err) => {
  console.error('数据库连接异常：', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('正在重新连接数据库...');
    db.connect(); // 自动重连
  } else {
    throw err;
  }
});

module.exports = db;