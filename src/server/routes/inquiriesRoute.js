import { Router } from 'express'
import { checkSchema, validationResult, matchedData } from 'express-validator'
import {createInquiry,approveInquiry,getUnapprovedInquiries} from '../daos/inquiriesDao.js'
import { createInquiryValidationSchema } from '../utils/validationSchema.js'
import { requireAuth } from '../server.js' // Assuming requireAuth is exported from server.js
import { sendInquiryConfirmation } from '../utils/mailer.js'

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
    sendInquiryConfirmation(email,firstName);
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

export default router;

