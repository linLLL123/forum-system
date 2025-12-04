const mysql = require('mysql2/promise');

// 仅保留mysql2支持的配置项（移除keepAlive）
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'forum_user',
  password: '123456',
  database: 'forum_db',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

// 测试连接
pool.getConnection()
  .then(conn => {
    console.log('✅ 数据库连接成功');
    conn.release();
  })
  .catch(err => console.error('❌ 数据库连接失败：', err));

module.exports = pool;