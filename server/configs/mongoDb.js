import mongoose from "mongoose";

const connectDb = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log("Database connected");
    });

    mongoose.connection.on('error', (err) => {
      console.error("Database connection error:", err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log("Database disconnected");
    });
    
    await mongoose.connect(process.env.URI, {
      dbName: 'bg-removal'  
    });
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    throw err; 
  }
};

export default connectDb;
