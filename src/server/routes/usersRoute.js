// routes/users.js
import { Router } from 'express'
import { checkSchema, validationResult, matchedData } from 'express-validator'
import { createUser, getUsers, deleteUser, checkLogin} from '../daos/usersDao.js'
import { createUserValidationSchema } from '../utils/validationSchema.js'
import { requireAuth } from '../server.js' // Assuming requireAuth is exported from server.js

const router = Router()

// POST   /api/users
router.post('/secure/api/users',checkSchema(createUserValidationSchema), async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { companyID, firstName, lastName, email, password, isAdmin } = matchedData(req)
    const role = isAdmin ? 'a' : 'e'
    try {
      const result = await createUser(companyID, email, password, firstName, lastName, role)
      res.status(201).json({ userId: result.insertId, firstName, lastName, role })
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' })
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  }
)

// GET    /api/users
router.get('/secure/api/users', requireAuth, async (req, res) => {
  try {
    const users = await getUsers()
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/users/:id
router.delete('/secure/api/users/:id', requireAuth, async (req, res) => {
  try {
    const result = await deleteUser(req.params.id)
    if (result.affectedRows === 0) {
            // no such user existed
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ status: 'User deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST   /api/users/login
router.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await checkLogin(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // store the minimal session payload
  req.session.user = {
    userId:    user.id,
    email:     user.email,
    companyId: user.companyID,
    role:      user.role,
    firstLogin: user.firstLogin
  };

  return res.json({ message: 'Login successful' });
});

router.post("/api/users/logout", requireAuth, async (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(302).json({ error: 'Redirect to /signin.html' });
    }
    res.json({ message: 'Logout successful' });
  });
});

export default router