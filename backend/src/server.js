import express from 'express';
import path from 'path';
import cors from 'cors';

import { serve } from 'inngest/express';

import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';
import { inngest, functions } from './lib/inngest.js';

const app = express();

const __dirname = path.resolve();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    Credentials: true,
  })
);

app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions,
  })
);

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

// if (ENV.NODE_ENV === 'production') {
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
});
// }

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () =>
      console.log('server is running on port ' + ENV.PORT)
    );
  } catch (error) {
    console.error('error starting thi server', error);
  }
};

startServer();

export { app };
