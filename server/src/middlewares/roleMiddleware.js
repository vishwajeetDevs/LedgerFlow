import { errorResponse } from "../utils/apiResponse.js";

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, "Forbidden: insufficient permissions");
    }
    next();
  };
};
