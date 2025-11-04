import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

try {
  const result = await cloudinary.uploader.upload("./public/test.jpg", {
    folder: "quemona/test",
  });
  console.log("✅ Cloudinary conectado correctamente");
  console.log("🌐 URL de la imagen subida:", result.secure_url);
} catch (error) {
  console.error("❌ Error conectando a Cloudinary:", error);
}
