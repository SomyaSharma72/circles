import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

const seedInitialData = async () => {
  // Preseeded sample data removed as requested - starting with clean/empty database
  try {
    console.log('Database initialized with clean state (no preseeded sample data).');
  } catch (err) {
    console.error('Error in DB setup:', err);
  }
};

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected (Atlas/Custom): ${conn.connection.host}`);
    } else {
      console.warn('MONGODB_URI environment variable is not defined. Starting in-memory MongoDB server...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
    }
    await seedInitialData();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (!mongoMemoryServer && !process.env.MONGODB_URI) {
      try {
        console.warn('Attempting MongoMemoryServer fallback after error...');
        mongoMemoryServer = await MongoMemoryServer.create();
        const uri = mongoMemoryServer.getUri();
        await mongoose.connect(uri);
        console.log('MongoDB Connected via fallback MongoMemoryServer.');
        await seedInitialData();
        return;
      } catch (fallbackErr) {
        console.error('Fallback MongoMemoryServer failed:', fallbackErr.message);
      }
    }
  }
};

export default connectDB;

