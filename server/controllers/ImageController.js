import axios from "axios";
import fs from "fs";
import sharp from "sharp";
import FormData from "form-data";
import userModel from "../model/userModel.js";

const MAX_PIXELS = 30 * 1024 * 1024; 

const removeBgImage = async (req, res) => {
  try {
    const { clerkId } = req.body;
    const user = await userModel.findOne({ clerkId });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.creditBalance === 0) {
      return res.json({
        success: false,
        message: "No Credit Balance",
        creditBalance: user.creditBalance,
      });
    }

    if (req.file.size > 30 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "File size exceeds 30MB limit.",
      });
    }

    let imagePath = req.file.path;

    // Get image metadata and resize if it exceeds 25 megapixels
    const metadata = await sharp(imagePath).metadata();
    const currentPixels = metadata.width * metadata.height;
    if (currentPixels > MAX_PIXELS) {
      const scale = Math.sqrt(MAX_PIXELS / currentPixels);
      const resizedImagePath = `resized_${req.file.filename}`;

      await sharp(imagePath)
        .resize({
          width: Math.round(metadata.width * scale),
          height: Math.round(metadata.height * scale),
        })
        .toFile(resizedImagePath);

      imagePath = resizedImagePath;
    }

    const imageFile = fs.createReadStream(imagePath);

    // Create form data with image file and explicit MIME type
    const formData = new FormData();
    formData.append("image_file", imageFile, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const { data } = await axios.post(
      "https://clipdrop-api.co/remove-background/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
        timeout: 120000, // Extended timeout for large files
      }
    );

    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;

    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    res.json({
      success: true,
      resultImage,
      creditBalance: user.creditBalance - 1,
      message: "Background Removed",
    });

    // Clean up resized image file if it was created
    if (imagePath !== req.file.path) {
      fs.unlinkSync(imagePath); // Delete resized file after upload
    }
  } catch (error) {
    if (error.response) {
      console.log(
        `Error: ${error.response.status} - ${error.response.statusText}`
      );
      console.log("API Response Data:", error.response.data.toString());

      res.status(error.response.status).json({
        success: false,
        message:
          error.response.data.toString() ||
          `Request failed with status code ${error.response.status}`,
      });
    } else {
      console.log(error.message);
      res.json({ success: false, message: "Error processing image" });
    }
  }
};

export { removeBgImage };
