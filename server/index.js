import express from "express";
import "dotenv/config"; 
import cors from "cors";
import connectDb from "./configs/mongoDb.js";
import userRouter from "./routes/userRoutes.js";

// Initialize express app
const app = express();
await connectDb();

// Middleware
app.use(express.json());
app.use(cors());

// Basic route for testing server
app.get("/", (req, res) => {
  res.send("Hello from the server!");
});
app.use('/api/user',userRouter);

// Start the server and connect to the database
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server", error);
    process.exit(1); 
  }
};

// Start the server
startServer();
