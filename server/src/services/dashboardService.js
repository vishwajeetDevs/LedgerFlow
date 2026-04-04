import * as dashboardModel from "../models/dashboardModel.js";

export const getSummary = async (userId, role) => {
  const data = role >= 2
    ? await dashboardModel.getSystemSummary()
    : await dashboardModel.getSummary(userId);

  return {
    totalIncome: Number(data.totalIncome),
    totalExpense: Number(data.totalExpense),
    balance: Number(data.totalIncome) - Number(data.totalExpense),
  };
};

export const getCategorySummary = async (userId, role) => {
  const rows = role >= 2
    ? await dashboardModel.getSystemCategorySummary()
    : await dashboardModel.getCategorySummary(userId);

  return rows.map((row) => ({
    categoryId: row.category_id,
    categoryName: row.categoryName,
    type: row.type,
    total: Number(row.total),
  }));
};
