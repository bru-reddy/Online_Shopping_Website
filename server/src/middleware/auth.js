import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const token = req.cookies.cartiva_token;
  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie("cartiva_token");
    res.status(401).json({ message: "Session expired" });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}
