import express from 'express';
import path from 'path';
import cors from 'cors';

import { serve } from 'inngest/express';

import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';
import { inngest, functions } from './lib/inngest.js';
import { clerkMiddleware } from '@clerk/express';

import chatRoutes from './routes/chatRoutes.js';

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
app.use(clerkMiddleware());

app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions,
  })
);

app.use('/api/chart', chatRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    msg: 'healthy',
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
