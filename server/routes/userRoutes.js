import express from "express";
import { clerkWebhooks, paymentRazorpay, userCredit } from "../controllers/userController.js";
import authUser from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/webhooks", clerkWebhooks);
userRouter.get("/credits",authUser,userCredit);
userRouter.post('/pay-razor',authUser,paymentRazorpay)

export default userRouter;
  