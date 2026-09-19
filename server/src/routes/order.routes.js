import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, authorize("customer"), async (req, res, next) => {
  try {
    const { items, delivery, paymentMethod = "cod" } = req.body;
    if (!Array.isArray(items) || !items.length || !delivery) return res.status(400).json({ message: "Order items and delivery details are required" });
    const products = await Product.find({ _id: { $in: items.map(i => i.productId) }, active: true });
    const map = new Map(products.map(p => [p._id.toString(), p]));
    const groups = new Map();
    for (const item of items) {
      const product = map.get(String(item.productId)), quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: "Invalid product or quantity" });
      if (product.stock < quantity) return res.status(409).json({ message: "Insufficient stock for " + product.name });
      const sellerId = product.seller.toString();
      if (!groups.has(sellerId)) groups.set(sellerId, []);
      groups.get(sellerId).push({ product, quantity });
    }
    const created = [];
    for (const [sellerId, group] of groups) {
      const orderItems = group.map(({product,quantity}) => ({product:product._id,seller:product.seller,name:product.name,image:product.images?.[0]||"",quantity,price:product.price}));
      const subtotal = orderItems.reduce((sum,item)=>sum+item.price*item.quantity,0);
      const deliveryFee = subtotal >= 999 ? 0 : 49;
      const order = await Order.create({orderNumber:"CV-"+Date.now().toString().slice(-7)+"-"+Math.floor(Math.random()*90+10),customer:req.user.id,seller:sellerId,items:orderItems,subtotal,deliveryFee,total:subtotal+deliveryFee,delivery,paymentMethod});
      for (const {product,quantity} of group) { product.stock -= quantity; await product.save(); }
      await Notification.create({recipient:sellerId,order:order._id,type:"new_order",title:"New order received",message:"Order "+order.orderNumber+" was placed by a customer."});
      created.push(order);
    }
    res.status(201).json({ orders: created });
  } catch (error) { next(error); }
});

router.get("/mine", authenticate, async (req, res, next) => {
  try {
    const filter = req.user.role === "seller" ? { seller: req.user.id } : { customer: req.user.id };
    const orders = await Order.find(filter)
      .populate("customer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", authenticate, authorize("seller"), async (req, res, next) => {
  try {
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }
    const order = await Order.findOne({ _id: req.params.id, seller: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;
    await order.save();

    await Notification.create({
      recipient: order.customer,
      order: order._id,
      type: "order_status",
      title: "Order status updated",
      message: `Order ${order.orderNumber} is now ${order.status}.`
    });

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
