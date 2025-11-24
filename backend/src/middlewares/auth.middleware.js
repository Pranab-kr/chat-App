import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const userAuthMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded?.userId).select("-password");

    if (!user) {
      return next();
    }

    req.user = user;

    next();
  } catch (error) {
    next();
  }
};

export const ensureAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
