import express from "express";
import { createRecord, getRecords, getFilteredRecords, updateRecord, deleteRecord } from "../controllers/recordController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All roles — CRUD (ownership enforced in service layer)
router.post("/", authMiddleware, allowRoles(1, 2, 3), createRecord);
router.put("/:id", authMiddleware, allowRoles(1, 2, 3), updateRecord);
router.delete("/:id", authMiddleware, allowRoles(1, 2, 3), deleteRecord);

// All roles — view records (scope enforced in service: viewer=own, analyst/admin=all)
router.get("/", authMiddleware, allowRoles(1, 2, 3), getRecords);
router.get("/filter", authMiddleware, allowRoles(1, 2, 3), getFilteredRecords);

export default router;
