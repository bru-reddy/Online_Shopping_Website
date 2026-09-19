import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || ""
  };
}

function issueToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !["customer", "seller"].includes(role)) {
      return res.status(400).json({ message: "Name, email, password and valid role are required" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "An account with this email already exists" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role, phone });
    res.cookie("cartiva_token", issueToken(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.cookie("cartiva_token", issueToken(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("cartiva_token");
  res.json({ message: "Logged out" });
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
