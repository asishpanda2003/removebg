import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDb from "./configs/mongoDb.js";

//App config
const PORT = process.env.PORT || 3001;
const app = express();
await connectDb();


//Initialize Middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.listen(PORT, () => {
  console.log("Server Started " + PORT);
});
