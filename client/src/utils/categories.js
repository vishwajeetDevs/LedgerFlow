export const categories = [
  { id: 1, name: "Salary", type: "income" },
  { id: 2, name: "Freelance", type: "income" },
  { id: 3, name: "Investment", type: "income" },
  { id: 4, name: "Bonus", type: "income" },
  { id: 5, name: "Other Income", type: "income" },
  { id: 6, name: "Food & Dining", type: "expense" },
  { id: 7, name: "Transportation", type: "expense" },
  { id: 8, name: "Rent", type: "expense" },
  { id: 9, name: "Utilities", type: "expense" },
  { id: 10, name: "Other Expense", type: "expense" },
];

export const getCategoryName = (id) => {
  return categories.find((c) => c.id === id)?.name || "Unknown";
};
