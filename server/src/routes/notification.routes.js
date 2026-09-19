import { Router } from "express";
import Notification from "../models/Notification.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("order", "orderNumber status total")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/read", authenticate, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification });
  } catch (error) {
    next(error);
  }
});

router.post("/read-all", authenticate, async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    next(error);
  }
});

export default router;
