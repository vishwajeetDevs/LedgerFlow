import * as userService from "../services/userService.js";
import { createUserSchema, loginUserSchema, updateUserSchema, changePasswordSchema } from "../validations/userValidation.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createUser = async (req, res) => {
  try {
    const { error } = createUserSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[0].message);

    const user = await userService.createUser(req.body);
    return successResponse(res, 201, "User registered successfully", user);
  } catch (err) {
    if (err.message === "Email already registered") {
      return errorResponse(res, 409, err.message);
    }
    return errorResponse(res, 500, err.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { error } = loginUserSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[0].message);

    const data = await userService.loginUser(req.body.email, req.body.password);
    return successResponse(res, 200, "Login successful", data);
  } catch (err) {
    if (err.message === "Invalid email or password" || err.message.includes("banned")) {
      return errorResponse(res, 401, err.message);
    }
    return errorResponse(res, 500, err.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return successResponse(res, 200, "Users fetched successfully", users);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { error } = updateUserSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[0].message);

    const user = await userService.updateUser(req.params.id, req.body);
    return successResponse(res, 200, "User updated successfully", user);
  } catch (err) {
    if (err.message === "User not found") {
      return errorResponse(res, 404, err.message);
    }
    return errorResponse(res, 500, err.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[0].message);

    await userService.changePassword(req.params.id, req.body.newPassword);
    return successResponse(res, 200, "Password changed successfully");
  } catch (err) {
    if (err.message === "User not found") {
      return errorResponse(res, 404, err.message);
    }
    return errorResponse(res, 500, err.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return successResponse(res, 200, "User deactivated successfully");
  } catch (err) {
    if (err.message === "User not found") {
      return errorResponse(res, 404, err.message);
    }
    return errorResponse(res, 500, err.message);
  }
};

export const permanentDeleteUser = async (req, res) => {
  try {
    await userService.permanentDeleteUser(req.params.id);
    return successResponse(res, 200, "User permanently deleted");
  } catch (err) {
    if (err.message === "User not found") {
      return errorResponse(res, 404, err.message);
    }
    return errorResponse(res, 500, err.message);
  }
};
