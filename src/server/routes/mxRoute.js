import { Router } from 'express';
import { validateDomain } from '../utils/mxChecker.js';

const router = Router();

// Simple endpoint to verify that an email's domain has MX records.
router.get('/api/mx-check/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const valid = await validateDomain(email);
    return res.json({ valid });
  } catch (err) {
    console.error('Error validating email domain:', err);
    return res.status(500).json({ valid: false });
  }
});

export default router;