import { pool } from '../../../db/database.js';

export const createInvite = async (token) => {
  const [result] = await pool.query(
    'INSERT INTO invites (token) VALUES (?)',
    [token]
  );
  return { inviteID: result.insertId, token: token };
}

//i dont remember adding this but i think its unnecessary, check it out eventually
export const getInviteByToken = async (token) => {
    const [rows] = await pool.query(
        'SELECT * FROM invites WHERE token = ? LIMIT 1',
        [token]
    );
    if (rows.length === 0) {
        return null; // No valid invite found
    }
    return rows[0];
}

export const deleteInvite = async (token) => {
    const [result] = await pool.query(
        'DELETE FROM invites WHERE token = ?',
        [token]
    );
    return result; 
}

export const markInviteUsed = async (token) => {
    const [result] = await pool.query(
        'UPDATE invites SET used = 1 WHERE token = ?',
        [token]
    );
    return result;
}
