import axiosInstance from "./axios";

export const getDashboardSummary = async () => {
  const response = await axiosInstance.get("/dashboard/summary");
  return response.data;
};

export const getCategorySummary = async () => {
  const response = await axiosInstance.get("/dashboard/category-summary");
  return response.data;
};
