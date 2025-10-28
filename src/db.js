import mongoose from 'mongoose';

export async function connectDB(uri) {
  await mongoose.connect(uri, { dbName: 'quemona' });
  console.log('✅ MongoDB conectado');
}
