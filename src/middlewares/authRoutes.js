import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

export const verifyJWT = (req, res, next) => {
  try {
    // ✅ Check Authorization header first, then cookie as fallback
    const authHeader = req.headers?.authorization;
    const token =
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null) || req.cookies?.accessToken;

    if (!token) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid token"));
  }
};