import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random()*1e9) + path.extname(file.originalname).toLowerCase())
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype))
});
router.post("/", authenticate, authorize("seller"), upload.array("images", 8), (req,res) => {
  const base = process.env.PUBLIC_API_URL || req.protocol + "://" + req.get("host");
  res.status(201).json({ urls: req.files.map(file => base + "/uploads/" + file.filename) });
});
export default router;
