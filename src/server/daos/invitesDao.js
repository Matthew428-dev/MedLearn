import { pool } from '../../../db/database.js';

export const createInvite = async (tokenHash, role) => {
  const [result] = await pool.query(
    'INSERT INTO invites (tokenHash, role) VALUES (?,?)',
    [tokenHash, role]
  );

  //return the inviteID so it can be inserted into the corresponding
  //row in the inquiries table via the updateinquirystats endpoint (see inquiriesRoute.js)
  return { inviteID: result.insertId};
}

export const getUnusedInviteByTokenHash = async (tokenHash) => {
    const [rows] = await pool.query(
        'SELECT * FROM invites WHERE tokenHash = ? AND usedAt IS NULL AND expirationTime > NOW() LIMIT 1',
        [tokenHash]
    );
    if (rows.length === 0) {
        return null; // No valid invite found
    }
    return rows[0];
}

export const deleteInvite = async (tokenHash) => {
    const [result] = await pool.query(
        'DELETE FROM invites WHERE tokenHash = ?',
        [tokenHash]
    );
    return result; 
}

export const markInviteUsed = async (tokenHash) => {
    const [result] = await pool.query(
        'UPDATE invites SET usedAt = NOW() WHERE tokenHash = ?',
        [tokenHash]
    );
    return result;
}

//gets some values to be displayed on the onboarding page, the values come from
//the data the user enters when they submit their inquiry
export const getOnboardingInfoFromTokenHash = async (tokenHash) => {
    const [result] = await pool.query(
        'SELECT companyName, email, role, firstName, lastName, npi FROM invites NATURAL JOIN inquiries WHERE tokenHash = ? AND usedAt IS NULL AND expirationTime > NOW()',
        [tokenHash]
    );
    return result[0] || null;
}