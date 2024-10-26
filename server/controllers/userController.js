import { Webhook } from "svix";
import userModel from "../model/userModel.js"; // Corrected import
import Razorpay from "razorpay";
import transactionModel from "../model/transaction.js";

// API controller function to manage Clerk user with database
// http://localhost:300/api/user/webhooks

const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;
    switch (type) {
      case "user.created": {
        // Corrected case
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        // Corrected case
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        // Corrected case
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({});
        break;
      }
      default:
        res.json({ success: false, message: "Unhandled event type" });
        break;
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API Controller functoin tòget user available credit data

const userCredit = async (req, res) => {
  try {
    const { clerkId } = req.body;
    const userData = await userModel.findOne({ clerkId });

    res.json({ success: true, credits: userData.creditBalance });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


//Gateway Initialize
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//API to make payment for credit
const paymentRazorpay = async (req, res) => {
  try {
    const { clerkId, planId } = req.body;
    const userData = await userModel.findOne({ clerkId });

    if (!userData || !planId) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    let credits, plan, amount;

    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10 * 100; 
        break;
      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 50 * 100; 
        break;
      case "Business":
        plan = "Business";
        credits = 5000;
        amount = 250 * 100; 
        break;
      default:
        return res.json({ success: false, message: "Invalid Plan ID" });
    }

    const transactionData = {
      clerkId,
      plan,
      amount: amount / 100, 
      credits,
      date: Date.now(),
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: newTransaction._id.toString(),
    };

    const order = await razorpatInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log("Error creating Razorpay order:", error);
    res.json({ success: false, message: error.message });
  }
};


export { clerkWebhooks, userCredit,paymentRazorpay };
