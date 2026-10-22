import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServerInstance = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri === 'memory') {
      console.log('⚡ Initializing in-memory MongoDB server for local development/testing...');
      memoryServerInstance = await MongoMemoryServer.create();
      mongoUri = memoryServerInstance.getUri();
      console.log(`📦 In-memory MongoDB running at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If local connection failed and in dev, attempt fallback to in-memory server
    if (process.env.NODE_ENV === 'development' && !memoryServerInstance) {
      try {
        console.log('⚠️ Attempting fallback to in-memory MongoDB...');
        memoryServerInstance = await MongoMemoryServer.create();
        const fallbackUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback in-memory MongoDB connected: ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        console.error(`❌ Fallback failed: ${fallbackError.message}`);
        process.exit(1);
      }
    }
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    console.log('🛑 MongoDB disconnected cleanly');
  } catch (error) {
    console.error(`Error disconnecting MongoDB: ${error.message}`);
  }
};
