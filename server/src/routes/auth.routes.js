import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

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

function setAuthCookie(res, user) {
  res.cookie("cartiva_token", issueToken(user), {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, password, role, phone } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!name?.trim() || !email || !password || !["customer", "seller"].includes(role)) {
      return res.status(400).json({
        message: "Name, email, password and valid role are required"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        code: "EMAIL_EXISTS",
        message: "This email ID already exists. Do you want to sign in?"
      });
    }

    const hashed = await bcrypt.hash(password, 12);

    try {
      const user = await User.create({
        name: name.trim(),
        email,
        password: hashed,
        role,
        phone: phone?.trim() || ""
      });

      setAuthCookie(res, user);
      return res.status(201).json({ user: publicUser(user) });
    } catch (error) {
      // Protect against two simultaneous registrations with the same email.
      if (error?.code === 11000 && error?.keyPattern?.email) {
        return res.status(409).json({
          code: "EMAIL_EXISTS",
          message: "This email ID already exists. Do you want to sign in?"
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

const ownerLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: "OWNER_LOGIN_RATE_LIMITED", message: "Too many owner login attempts. Please try again later." }
});

router.post("/owner-login", ownerLoginLimiter, async (req, res, next) => {
  try {
    const code = String(req.body.code || "").trim();
    const expected = String(process.env.OWNER_AUTH_CODE || "").trim();

    if (!expected) {
      return res.status(503).json({
        code: "OWNER_AUTH_NOT_CONFIGURED",
        message: "Owner authentication is not configured on the server."
      });
    }

    if (!code || code.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(code), Buffer.from(expected))) {
      return res.status(401).json({
        code: "INVALID_OWNER_CODE",
        message: "Invalid owner authentication code."
      });
    }

    let owner = await User.findOne({ role: "owner" }).select("+password");

    if (!owner) {
      const ownerPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
      owner = await User.create({
        name: process.env.OWNER_NAME || "Cartiva Owner",
        email: process.env.OWNER_EMAIL || "owner@cartiva.local",
        password: ownerPassword,
        role: "owner",
        phone: ""
      });
    }

    setAuthCookie(res, owner);
    return res.json({ user: publicUser(owner) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      });
    }

    setAuthCookie(res, user);
    return res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("cartiva_token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
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
