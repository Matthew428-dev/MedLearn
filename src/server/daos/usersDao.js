import { pool } from '../../../db/database.js';
import bcrypt from 'bcrypt';


export const createUser = async (companyID, email, password, firstName, lastName, role) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  const [result] = await pool.query(
    `INSERT INTO users (companyID, firstName, lastName, role, email, password_hash)
     VALUES (
       ?, ?, ?, ?, ?, ?
     )`,
    [companyID, firstName, lastName, role, email, hash]
  );
  return result;
};

export const getUsers = async () => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
};

export const getUserByID = async (id) => {
  const [rows] = await pool.query('SELECT firstLogin, companyID, firstName, lastName, role, email, profilePicture FROM users WHERE id = ?', [id]);
  if (rows.length === 0) {
    return null; // No user found with the given id
  }
  return rows[0];
};

export const deleteUser = async(id) => {
  const [rows] = await pool.query('DELETE FROM users WHERE id = ?', id);
  return rows;
};

export const checkLogin = async (email, password) => {
  const [rows] = await pool.query(
    'SELECT firstLogin, id, firstName, lastName, companyID, role, email, password_hash FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  if (!rows.length) return false;            // email not found

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return false;                  // bad password

  // return ONLY the data needed for the session
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, companyID: user.companyID, role: user.role, firstLogin: user.firstLogin };
};

export const updateProfilePictureUrl = async(url, id) => {
  const [rows] = await pool.query("UPDATE users SET profilePicture = ? WHERE id = ?",[url,id]);
  return rows;
}