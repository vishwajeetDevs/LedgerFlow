import pool from "../config/db.js";

export const getSummary = async (user_id) => {
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS "totalIncome",
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS "totalExpense"
     FROM tbl_records WHERE user_id = $1`,
    [user_id]
  );
  return result.rows[0];
};

export const getSystemSummary = async () => {
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS "totalIncome",
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS "totalExpense"
     FROM tbl_records`
  );
  return result.rows[0];
};

export const getCategorySummary = async (user_id) => {
  const result = await pool.query(
    `SELECT
       r.category_id,
       c.name AS "categoryName",
       r.type,
       COALESCE(SUM(r.amount), 0) AS total
     FROM tbl_records r
     LEFT JOIN tbl_record_categories c ON r.category_id = c.id
     WHERE r.user_id = $1
     GROUP BY r.category_id, c.name, r.type
     ORDER BY total DESC`,
    [user_id]
  );
  return result.rows;
};

export const getSystemCategorySummary = async () => {
  const result = await pool.query(
    `SELECT
       r.category_id,
       c.name AS "categoryName",
       r.type,
       COALESCE(SUM(r.amount), 0) AS total
     FROM tbl_records r
     LEFT JOIN tbl_record_categories c ON r.category_id = c.id
     GROUP BY r.category_id, c.name, r.type
     ORDER BY total DESC`
  );
  return result.rows;
};
