import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype));
  }
});

const cloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "cartiva/products",
        resource_type: "image"
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
}

router.post(
  "/",
  authenticate,
  authorize("seller"),
  upload.array("images", 8),
  async (req, res, next) => {
    try {
      if (!cloudinaryConfigured()) {
        return res.status(503).json({
          message: "Product image storage is not configured on the server."
        });
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const results = await Promise.all((req.files || []).map(uploadToCloudinary));

      res.status(201).json({
        urls: results.map(result => result.secure_url)
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
