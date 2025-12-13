import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.DB_URL);
    console.log('connected to db:', conn.connection.host);
  } catch (error) {
    console.error('Error connecting to db', error);
    process.exit(1); //0为成功 1为失败
  }
};
