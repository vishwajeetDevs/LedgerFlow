import express from "express";
import { getSummary, getCategorySummary } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Viewer + Analyst + Admin — view dashboard
router.get("/summary", authMiddleware, allowRoles(1, 2, 3), getSummary);
router.get("/category-summary", authMiddleware, allowRoles(1, 2, 3), getCategorySummary);

export default router;
