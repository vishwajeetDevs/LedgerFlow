import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/apiResponse.js";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return errorResponse(res, 401, "No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return errorResponse(res, 401, "Invalid token");
  }
};
