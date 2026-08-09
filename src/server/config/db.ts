import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// CRITICAL: Disable Mongoose command buffering so queries fail immediately if DB is disconnected
// instead of hanging for 10000ms with "Operation users.findOne() buffering timed out".
mongoose.set('bufferCommands', false);

const DEFAULT_MONGO_URI =
  'mongodb+srv://j25ds128_db_user:96eJkF13iBfFd9nF@brainwave1.lntawkk.mongodb.net/neighborly?appName=brainwave1';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoURI, {
      dbName: 'neighborly',
      serverSelectionTimeoutMS: 3000, // Timeout fast (3s) if unreachable
      connectTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected to Atlas Host: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.warn(`⚠️ MongoDB Connection Error (${error?.message || 'Unreachable'}). Falling back to high-performance In-Memory Datastore.`);
    return null;
  }
};

export const checkDBHealth = () => {
  const state = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  return {
    status: state === 1 ? 'healthy' : 'mock_store_active',
    readyState: state,
    host: mongoose.connection.host || 'In-Memory Fallback Store',
  };
};
