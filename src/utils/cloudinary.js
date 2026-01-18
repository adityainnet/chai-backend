import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

let isConfigured = false;

const configureCloudinary = () => {
  if (isConfigured) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log("CLOUDINARY CONFIG CHECK:", {
    cloud: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY ? "LOADED" : "MISSING",
    secret: process.env.CLOUDINARY_API_SECRET ? "LOADED" : "MISSING",
  });

  isConfigured = true;
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // ✅ CONFIGURE HERE (runtime, after dotenv)
    configureCloudinary();

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      folder: "users",
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error("❌ CLOUDINARY ERROR:", error.message);

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };
