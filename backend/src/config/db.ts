import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workspace_manager';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[Database Error] Could not connect to MongoDB at ${mongoURI}:`, error.message);
    console.warn('[Database] Running without persistent DB until MongoDB is reachable.');
  }
}

export default connectDB;
