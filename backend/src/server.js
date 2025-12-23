import express from 'express';
import path from 'path';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';

const app = express();

const __dirname = path.resolve();

// middleware
app.use(express.json());

// serve static files (works in both dev and production)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API routes
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

// SPA fallback - serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
});

// Initialize database connection
const initDB = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// Only start server in local development
if (process.env.NODE_ENV !== 'production') {
  initDB().then(() => {
    app.listen(ENV.PORT || 3000, () =>
      console.log('server is running on port ' + (ENV.PORT || 3000))
    );
  });
} else {
  // In Vercel environment, just initialize DB
  initDB();
}

export default app;
