import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, index: true },
  imageUrl: { type: String }, // /uploads/... o URL de Cloudinary
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
