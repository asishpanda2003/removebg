import mongoose from "mongoose";

const connectDb = async () => {
  try {
    // Set up event listeners for connection
    mongoose.connection.on('connected', () => {
      console.log("Database connected");
    });

    mongoose.connection.on('error', (err) => {
      console.error("Database connection error:", err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log("Database disconnected");
    });

    // Connect to the database
    await mongoose.connect(process.env.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'bg-removal'  // Set the database name
    });
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    throw err;  // Re-throw error if you want the calling function to handle it
  }
};

export default connectDb;
