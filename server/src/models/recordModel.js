import pool from "../config/db.js";

export const createRecord = async ({ user_id, amount, type, category_id, date, notes }) => {
  const result = await pool.query(
    `INSERT INTO tbl_records (user_id, amount, type, category_id, date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, amount, type, category_id, date, notes]
  );
  return result.rows[0];
};

export const getRecordsByUserId = async (user_id) => {
  const result = await pool.query(
    `SELECT * FROM tbl_records WHERE user_id = $1 ORDER BY date DESC`,
    [user_id]
  );
  return result.rows;
};

export const getAllRecords = async () => {
  const result = await pool.query(
    `SELECT r.*, u.name AS user_name
     FROM tbl_records r
     LEFT JOIN tbl_users u ON r.user_id = u.id
     ORDER BY r.date DESC`
  );
  return result.rows;
};

export const getFilteredRecords = async (user_id, { category_id, type, startDate, endDate }) => {
  let query = `SELECT * FROM tbl_records WHERE user_id = $1`;
  const params = [user_id];
  let paramIndex = 2;

  if (category_id) {
    query += ` AND category_id = $${paramIndex++}`;
    params.push(category_id);
  }
  if (type) {
    query += ` AND type = $${paramIndex++}`;
    params.push(type);
  }
  if (startDate) {
    query += ` AND date >= $${paramIndex++}`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND date <= $${paramIndex++}`;
    params.push(endDate);
  }

  query += ` ORDER BY date DESC`;
  const result = await pool.query(query, params);
  return result.rows;
};

export const getAllFilteredRecords = async ({ category_id, type, startDate, endDate }) => {
  let query = `SELECT r.*, u.name AS user_name FROM tbl_records r LEFT JOIN tbl_users u ON r.user_id = u.id WHERE 1=1`;
  const params = [];
  let paramIndex = 1;

  if (category_id) {
    query += ` AND r.category_id = $${paramIndex++}`;
    params.push(category_id);
  }
  if (type) {
    query += ` AND r.type = $${paramIndex++}`;
    params.push(type);
  }
  if (startDate) {
    query += ` AND r.date >= $${paramIndex++}`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND r.date <= $${paramIndex++}`;
    params.push(endDate);
  }

  query += ` ORDER BY r.date DESC`;
  const result = await pool.query(query, params);
  return result.rows;
};

export const getRecordById = async (id) => {
  const result = await pool.query(`SELECT * FROM tbl_records WHERE id = $1`, [id]);
  return result.rows[0];
};

export const updateRecord = async (id, user_id, { amount, type, category_id, date, notes }) => {
  const result = await pool.query(
    `UPDATE tbl_records SET amount = $1, type = $2, category_id = $3, date = $4, notes = $5
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [amount, type, category_id, date, notes, id, user_id]
  );
  return result.rows[0];
};

export const updateRecordById = async (id, { amount, type, category_id, date, notes }) => {
  const result = await pool.query(
    `UPDATE tbl_records SET amount = $1, type = $2, category_id = $3, date = $4, notes = $5
     WHERE id = $6
     RETURNING *`,
    [amount, type, category_id, date, notes, id]
  );
  return result.rows[0];
};

export const deleteRecord = async (id, user_id) => {
  const result = await pool.query(
    `DELETE FROM tbl_records WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, user_id]
  );
  return result.rows[0];
};

export const deleteRecordById = async (id) => {
  const result = await pool.query(
    `DELETE FROM tbl_records WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};
