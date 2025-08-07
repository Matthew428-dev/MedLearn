import { pool } from '../../../db/database.js';

export const createInquiry = async (email, firstName, lastName, companyName, npi,inquiryType, phoneNumber,numOfUsers,msg) => {
    const [result] = await pool.query(
        'INSERT INTO inquiries (email, firstName, lastName, companyName, npi, inquiryType, phoneNumber,numOfUsers,msg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [email, firstName, lastName, companyName, npi, inquiryType, phoneNumber,numOfUsers,msg]
    );
    return result;
}

//OLD CODE -> UPDAED TO UPDATE INQUIRY STATUS
/*export const approveInquiry = async (inquiryID, inviteID) => {
    const [result] = await pool.query(
        'UPDATE inquiries SET approved = 1, inviteID = ? WHERE inquiryID = ?',
        [inviteID, inquiryID]
    );
    return result;
}

export const denyInquiry = async (inquiryID) => {
    const [result] = await pool.query(
        'UPDATE inquiries SET approved = -1 WHERE inquiryID = ?',
        [inquiryID]
    );
    return result;
}*/

//updates the status of the inquiry and also inserts the inviteID, if applicable
export const updateInquiryStatus = async (inquiryID, approved, inviteID = null) => {
    const [result] = await pool.query(
        "UPDATE inquiries SET approved = ?, inviteID = ? WHERE inquiryID = ?", [approved, inviteID, inquiryID]
    );
    return result;
}

export const getPendingInquiries = async () => {
    //only returns inquiries that have not been approved yet
    const [rows] = await pool.query('SELECT inquiryID, firstName, lastName, companyName, createdAt FROM inquiries WHERE approved = 0');
    return rows;
}

export const getInquiryByID = async (inquiryID) => {
    const [rows] = await pool.query('SELECT * FROM inquiries WHERE inquiryID = ?', [inquiryID]);
    return rows[0];
}
