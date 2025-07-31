import { pool } from '../../../db/database.js';

export const createCompany = async (companyName) => {
  const [result] = await pool.query(
    'INSERT INTO companies (companyName) VALUES (?)',
    [companyName]
  );
  return result;              // contains insertId, affectedRows, …
};

export const getCompanies = async () => {
  const [rows] = await pool.query('SELECT * FROM companies');
  return rows;
};

export const deleteCompany = async(companyName) => {
  const [rows] = await pool.query('DELETE FROM companies WHERE companyName = ?', companyName);
  return rows;
};