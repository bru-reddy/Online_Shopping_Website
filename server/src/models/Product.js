import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String, trim: true }],
  category: { type: String, required: true, trim: true, maxlength: 60 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  active: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, { timestamps: true });

productSchema.index({ name: "text", description: "text", category: "text" });

export default mongoose.model("Product", productSchema);
