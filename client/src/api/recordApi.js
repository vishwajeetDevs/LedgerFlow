import axiosInstance from "./axios";

export const getRecords = async () => {
  const res = await axiosInstance.get("/records");
  return res.data;
};

export const createRecord = async (data) => {
  const res = await axiosInstance.post("/records", data);
  return res.data;
};

export const updateRecord = async (id, data) => {
  const res = await axiosInstance.put(`/records/${id}`, data);
  return res.data;
};

export const deleteRecord = async (id) => {
  const res = await axiosInstance.delete(`/records/${id}`);
  return res.data;
};
