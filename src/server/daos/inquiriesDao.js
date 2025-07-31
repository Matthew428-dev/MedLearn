import { pool } from '../../../db/database.js';
import bcrypt from 'bcrypt';

export const createInquiry = async (email, firstName, lastName, companyName, npi,inquiryType, phoneNumber,numOfUsers,msg) => {
    const [result] = await pool.query(
        'INSERT INTO inquiries (email, firstName, lastName, companyName, npi, inquiryType, phoneNumber,numOfUsers,msg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [email, firstName, lastName, companyName, npi, inquiryType, phoneNumber,numOfUsers,msg]
    );
    return result;
}

export const approveInquiry = async (inquiryID, inviteID) => {
    const [result] = await pool.query(
        'UPDATE inquiries SET approved = 1, inviteID = ? WHERE inquiryID = ?',
        [inviteID, inquiryID]
    );
    return result;
}

export const getUnapprovedInquiries = async () => {
    //only returns inquiries that have not been approved yet
    const [rows] = await pool.query('SELECT * FROM inquiries WHERE approved = 0');
    return rows;
}

