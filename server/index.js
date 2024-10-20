import express from "express"
import 'dotenv/config'
import cors from "cors"
import connectDB from "./configs/mongoDB.js";

//App config
const PORT=process.env.PORT || 4000;
const app=express()
await connectDB()

//Middleware
app.use(express.json())
app.use(cors())

//Api toute
app.get('/',(req,res)=>{
    res.send('Hello World');
})

app.listen(PORT,()=>{
    console.log("Server is Running "+PORT);
    
})