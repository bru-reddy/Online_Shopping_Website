import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["customer", "seller"], required: true },
  phone: { type: String, trim: true, maxlength: 20 }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
