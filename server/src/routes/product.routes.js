import { Router } from "express";
import Product from "../models/Product.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { search = "", category, seller, limit = 24, page = 1 } = req.query;
    const filter = { active: true };
    if (category) filter.category = category;
    if (seller) filter.seller = seller;
    if (search.trim()) filter.$text = { $search: search.trim() };

    const pageSize = Math.min(Number(limit) || 24, 60);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * pageSize;
    const [products, total] = await Promise.all([
      Product.find(filter).populate("seller", "name").sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Product.countDocuments(filter)
    ]);
    res.json({ products, total, page: Math.floor(skip / pageSize) + 1, pages: Math.ceil(total / pageSize) });
  } catch (error) {
    next(error);
  }
});

router.get("/mine", authenticate, authorize("seller"), async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, active: true }).populate("seller", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticate, authorize("seller"), async (req, res, next) => {
  try {
    const { name, description, price, images = [], category, stock } = req.body;
    if (!name || !description || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "Name, description, category, price and stock are required" });
    }
    const product = await Product.create({
      seller: req.user.id, name, description, price: Number(price),
      images: Array.isArray(images) ? images.slice(0, 8) : [], category, stock: Number(stock)
    });
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", authenticate, authorize("seller"), async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const allowed = ["name", "description", "price", "images", "category", "stock", "active"];
    for (const key of allowed) if (req.body[key] !== undefined) product[key] = req.body[key];
    await product.save();
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authenticate, authorize("seller"), async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      { active: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product removed" });
  } catch (error) {
    next(error);
  }
});

export default router;
