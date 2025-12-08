import express from 'express';
import path from 'path';
import { ENV } from './lib/env.js';

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

app.listen(ENV.PORT, () => {
  console.log('server is running on port ' + ENV.PORT);
});
