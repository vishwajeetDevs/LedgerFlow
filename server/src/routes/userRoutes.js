import express from "express";
import { createUser, loginUser, getAllUsers, updateUser, changePassword, deleteUser, permanentDeleteUser } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);

// Analyst + Admin — view users
router.get("/", authMiddleware, allowRoles(2, 3), getAllUsers);

// Admin only — modify users
router.put("/:id", authMiddleware, allowRoles(3), updateUser);
router.patch("/:id/password", authMiddleware, allowRoles(3), changePassword);
router.delete("/:id", authMiddleware, allowRoles(3), deleteUser);
router.delete("/:id/permanent", authMiddleware, allowRoles(3), permanentDeleteUser);

export default router;
