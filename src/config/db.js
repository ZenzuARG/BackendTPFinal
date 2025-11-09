import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coderBackend';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'coderBackend'
    });
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB', err);
    process.exit(1);
  }
}
