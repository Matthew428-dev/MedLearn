// routes/companies.js
import { Router } from 'express'
import { checkSchema, validationResult, matchedData } from 'express-validator'
import { createCompany, getCompanies, deleteCompany } from '../daos/companiesDao.js'
import { createCompanyValidationSchema } from '../utils/validationSchema.js'

const router = Router()

// POST   /api/companies
router.post('/api/companies', checkSchema(createCompanyValidationSchema), async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { companyName } = matchedData(req)
    try {
      const result = await createCompany(companyName)
      res.status(201).json({ companyId: result.insertId, companyName })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  }
)

// GET    /api/companies
router.get('/api/companies', async (req, res) => {
  try {
    const companies = await getCompanies()
    res.json(companies)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/companies/:companyName
router.delete('/api/companies/:companyName', async (req, res) => {
  try {
    const result = await deleteCompany(req.params.companyName)
    if (result.affectedRows === 0) {
        // no such company existed
        return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ status: 'Company (and its user(s), if applicable) deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

