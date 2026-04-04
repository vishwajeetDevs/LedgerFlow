import * as userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

export const createUser = async (data) => {
  const existing = await userModel.findByEmail(data.email);
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await userModel.createUser({
    ...data,
    password: hashedPassword,
  });
};

export const loginUser = async (email, password) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw new Error("Invalid email or password");

  if (!user.is_active) throw new Error("Your account has been banned. Please contact the administrator.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = generateToken(user);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role_id: user.role_id,
    token,
  };
};

export const getAllUsers = async () => {
  return await userModel.getAllUsers();
};

export const updateUser = async (id, data) => {
  const updated = await userModel.updateUser(id, data);
  if (!updated) throw new Error("User not found");
  return updated;
};

export const changePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updated = await userModel.changePassword(id, hashedPassword);
  if (!updated) throw new Error("User not found");
  return updated;
};

export const deleteUser = async (id) => {
  const deleted = await userModel.deleteUser(id);
  if (!deleted) throw new Error("User not found");
  return deleted;
};
