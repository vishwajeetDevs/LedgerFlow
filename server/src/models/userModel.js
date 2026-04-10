import pool from "../config/db.js";

export const createUser = async ({ name, email, password, role_id }) => {
  const result = await pool.query(
    `INSERT INTO tbl_users (name, email, password, role_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, password, role_id]
  );

  return result.rows[0];
};

export const findByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM tbl_users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role_id, r.name AS role_name, u.is_active, u.created_at
     FROM tbl_users u
     LEFT JOIN tbl_roles r ON u.role_id = r.id
     ORDER BY u.created_at DESC`
  );
  return result.rows;
};

export const updateUser = async (id, { name, email, role_id, is_active }) => {
  const result = await pool.query(
    `UPDATE tbl_users
     SET name = $1, email = $2, role_id = $3, is_active = $4
     WHERE id = $5
     RETURNING id, name, email, role_id, is_active, created_at`,
    [name, email, role_id, is_active, id]
  );
  return result.rows[0];
};

export const changePassword = async (id, hashedPassword) => {
  const result = await pool.query(
    `UPDATE tbl_users SET password = $1 WHERE id = $2 RETURNING id, name, email`,
    [hashedPassword, id]
  );
  return result.rows[0];
};

export const deleteUser = async (id) => {
  const result = await pool.query(
    `UPDATE tbl_users SET is_active = false WHERE id = $1
     RETURNING id, name, email, role_id, is_active`,
    [id]
  );
  return result.rows[0];
};

export const permanentDeleteUser = async (id) => {
  await pool.query(`DELETE FROM tbl_records WHERE user_id = $1`, [id]);
  const result = await pool.query(
    `DELETE FROM tbl_users WHERE id = $1 RETURNING id, name`,
    [id]
  );
  return result.rows[0];
};
