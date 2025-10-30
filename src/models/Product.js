import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String },
  imageUrl: { type: String } // URL de Cloudinary
}, { timestamps: true });

// Exportación por defecto (default)
const Product = mongoose.model("Product", productSchema);
export default Product;
