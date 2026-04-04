import * as dashboardService from "../services/dashboardService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getSummary = async (req, res) => {
  try {
    const summary = await dashboardService.getSummary(req.user.id, req.user.role);
    return successResponse(res, 200, "Dashboard summary fetched successfully", summary);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getCategorySummary = async (req, res) => {
  try {
    const data = await dashboardService.getCategorySummary(req.user.id, req.user.role);
    return successResponse(res, 200, "Category summary fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
