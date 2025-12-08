import express from 'express';
import { ENV } from './lib/env.js';

const app = express();

console.log(ENV.PORT);

app.get('/', (req, res) => {
  res.status(200).json({
    msg: 'success from backend',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    msg: 'healthy',
  });
});

app.listen(ENV.PORT, () => {
  console.log('server is running on port ' + ENV.PORT);
});
