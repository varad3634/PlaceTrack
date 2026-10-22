import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed demonstration data if database is empty
    const User = (await import('./models/User.js')).default;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Auto-seeding demonstration records...');
      const { seedData } = await import('../scripts/seed.js');
      await seedData();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 PlaceTrack Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error(`Fatal Server Startup Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
