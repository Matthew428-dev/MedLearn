import { Router } from 'express'
import { checkSchema, validationResult, matchedData } from 'express-validator';
import {createInquiry,updateInquiryStatus,getPendingInquiries,getInquiryByID} from '../daos/inquiriesDao.js';
import {createInvite} from '../daos/invitesDao.js';
import { createInquiryValidationSchema, updateInquiryValidationSchema } from '../utils/validationSchema.js';
import { requireAdmin } from '../server.js';
import { sendInquiryConfirmation } from '../utils/mailer.js';
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
    await sendInquiryConfirmation(email, firstName)
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

//approve an inquiry
router.patch("/api/inquiries/:id/updatestatus",/*checkSchema(updateInquiryValidationSchema),*/requireAdmin, async (req,res) => {
  //TODO: Update inquiry status (approved or denied) and create the invite
  
  //checks for validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //create the token(s)
  const plainToken = randomBytes(32).toString('hex'); // send this in the link within the email
  const tokenHash  = await bcrypt.hash(plainToken, 10); // store this in invites table in mysql

  //get the values from the req
  const { status } = req.body;
  const {inquiryID} = req.params;

  if(status === "1"){ //inquiry is approved
    try{
      //create invite
      const newInvite = await createInvite(tokenHash);
      
      //update the inquiries status and insert the inviteID from the new invite
      const statusUpdate = updateInquiryStatus(inquiryID, status, newInvite.inviteID);

      //TODO: send confirmation email


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
      const statusUpdate = updateInquiryStatus(inquiryID, status, null);
      return res.status(201).json({message: "Success, status updated to denied"})
    }
    catch(error){
      console.error("Failed updating inquiry status: ", error);
      return res.status(500).json({error: "Failed creating invite and/or updating inquiry status"});
    }
  }

});

export default router;

