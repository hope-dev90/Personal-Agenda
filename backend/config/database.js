import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      (process.env.NODE_ENV !== "production"
        ? "mongodb://127.0.0.1:27017/agendaDB"
        : null);

    if (!mongoUri) {
      throw new Error("Missing MONGO_URI or MONGODB_URI environment variable");
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
  }
};

export default connectDB;
