import express from 'express';
import path from 'path';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';

const app = express();

const __dirname = path.resolve();

console.log(ENV.PORT);

// app.get('/', (req, res) => {
//   res.status(200).json({
//     msg: 'success from backend',
//   });
// });

app.get('/health', (req, res) => {
  res.status(200).json({
    msg: 'healthy',
  });
});
app.get('/books', (req, res) => {
  res.status(200).json({
    msg: 'this is the books endpointt',
  });
});

// make our app ready for deployment

if (ENV.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// 初始化数据库连接
const initDB = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// 只在本地开发时启动服务器
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    await initDB();
    app.listen(ENV.PORT || 3000, () =>
      console.log('server is running on port ' + (ENV.PORT || 3000))
    );
  };
  startServer();
} else {
  // Vercel环境中只初始化数据库
  initDB();
}

export default app;
