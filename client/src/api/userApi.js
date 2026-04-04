import axiosInstance from "./axios";

export const getUsers = async () => {
  const res = await axiosInstance.get("/users");
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await axiosInstance.put(`/users/${id}`, data);
  return res.data;
};

export const changePassword = async (id, newPassword) => {
  const res = await axiosInstance.patch(`/users/${id}/password`, { newPassword });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axiosInstance.delete(`/users/${id}`);
  return res.data;
};
