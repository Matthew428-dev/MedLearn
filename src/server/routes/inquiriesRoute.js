import { Router } from 'express'
import { checkSchema, validationResult, matchedData } from 'express-validator';
import {createInquiry,updateInquiryStatus,getPendingInquiries,getInquiryByID} from '../daos/inquiriesDao.js';
import {createInvite} from '../daos/invitesDao.js';
import { createInquiryValidationSchema, updateInquiryValidationSchema } from '../utils/validationSchema.js';
import { requireAdmin } from '../server.js';
import { sendInquiryConfirmationEmail, sendInquiryApprovedEmail } from '../utils/mailer.js';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

const router = Router()

//create an inquiry
router.post('/api/inquiries', checkSchema(createInquiryValidationSchema), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email,firstName,lastName,companyName,npi,inquiryType,phoneNumber,numOfUsers,msg} = matchedData(req);
  try {
    const newInquiry = await createInquiry(email,firstName,lastName,companyName,npi,inquiryType,phoneNumber,numOfUsers,msg);
    await sendInquiryConfirmationEmail(email, firstName)
    return res.status(201).json(newInquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return res.status(400).json({ errors: errors.array() });
  }
});

//npi validation endpoint
router.get('/api/npi-validation/:npi', async (req, res) => {
  const { npi } = req.params;

  // npi must be exactly 10 digits (extra safeguard)
  if (!/^\d{10}$/.test(npi)) {
    return res.status(400).json({ valid: false, msg: 'NPI must be exactly 10 digits' });
  }

  try {
    const apiRes = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`
    );
    if (!apiRes.ok) {
      throw new Error(`Registry returned ${apiRes.status}`);
    }

    const data = await apiRes.json();
    const valid = Array.isArray(data.results) && data.results.length > 0;

    return res.json({
      valid,
      details: valid ? data.results[0] : null
    });
  } catch (err) {
    console.error('Error validating NPI:', err);
    return res.status(500).json({ error: 'Failed to validate NPI' });
  }
});

//get all unapproved inquiries
router.get('/api/inquiries/pending', requireAdmin, async (req, res) => {
  try {
    const inquiries = await getPendingInquiries();
    return res.json(inquiries);
  } catch (error) {
    console.error('Error fetching unapproved inquiries:', error);
    return res.status(500).json({ error: 'Failed to fetch unapproved inquiries' });
  }
});

//get the inquiry by inquiryID
router.get("/api/inquiries/:inquiryID", requireAdmin, async (req, res) => {
  const { inquiryID } = req.params;
  try {
    const inquiry = await getInquiryByID(inquiryID);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    return res.json(inquiry);
  } catch (error) {
    console.error('Error fetching inquiry details:', error);
    return res.status(500).json({ error: 'Failed to fetch inquiry details' });
  }
});

//approve an inquiry and create an invite
router.patch("/api/inquiries/:inquiryID/updatestatus",checkSchema(updateInquiryValidationSchema),requireAdmin, async (req,res) => {

  //checks for validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //create the token(s)
  const plainToken = randomBytes(32).toString('hex'); // send this in the link within the email
  const tokenHash  = await bcrypt.hash(plainToken, 10); // store this in invites table in mysql

  //get the values from the req
  const { status: statusRaw, inquiryID } = matchedData(req);
  const status = Number(statusRaw);

  if(status === 1){ //inquiry is approved
    try{
      //create invite
      const newInvite = await createInvite(tokenHash);
      
      //update the inquiries status and insert the inviteID from the new invite
      await updateInquiryStatus(inquiryID, status, newInvite.inviteID);
      
      //have to get the inquiry so that we can send the correct information in the email
      const inquiry = await getInquiryByID(inquiryID);

      //create the url for the invite link in the email
      const baseUrl    = process.env.FRONTEND_URL || 'http://localhost:3000';
      const inviteUrl  = `${baseUrl}/onboard?token=${plainToken}`;

      sendInquiryApprovedEmail(inquiry.email,inquiry.firstName,inquiry.lastName,inquiry.createdAt,inquiry.companyName,inviteUrl);

      return res.status(201).json({message: "Success, status updated to approved and invite created"});
    }
    catch (error){
      console.error("Failed creating invite and/or updating inquiry status: ", error);
      return res.status(500).json({ error: "Failed creating invite and/or updating inquiry status"});
    }
  }
  else{ //inquiry is not approved
    try{
      //update the status to denied, don't create invite, don't send email
      await updateInquiryStatus(inquiryID, status, null);
      return res.status(201).json({message: "Success, status updated to denied"})
    }
    catch(error){
      console.error("Failed updating inquiry status: ", error);
      return res.status(500).json({error: "Failed creating invite and/or updating inquiry status"});
    }
  }

});

export default router;

