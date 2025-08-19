// routes/users.js
import { Router } from 'express'
import { checkSchema, validationResult, matchedData } from 'express-validator';
import { createUser, getUsers, deleteUser, checkLogin, updateProfilePictureUrl } from '../daos/usersDao.js';

import { createUserValidationSchema } from '../utils/validationSchema.js';
import { requireAuth, requireManager, requireAdmin } from '../server.js';
import multer from 'multer';
import sharp from 'sharp';
import path from "path";
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// same folder server.js serves at /uploads
const uploadsRoot = path.resolve(__dirname, '../../client/public/assets/uploads');
fs.mkdirSync(uploadsRoot, { recursive: true });

// Multer config (memory) + 5 MB limit + image whitelist
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /image\/(png|jpe?g|webp)$/i.test(file.mimetype);
    cb(ok ? null : new Error('Only PNG/JPG/WEBP images allowed'), ok);
  }
});

const router = Router();

//create a new user
//this endpoint is commented out because i don't think i need it
//as users will be created via the onboarding endpoint
/*router.post('/secure/api/users',checkSchema(createUserValidationSchema), async (req, res) => {
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
)*/

// get all users -> useful later for the users section on the admin page
router.get('/secure/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE user by id
router.delete('/secure/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const result = await deleteUser(req.params.id)
    if (result.affectedRows === 0) {
            // no such user existed
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ status: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
})

// login endpoint
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
    firstLogin: user.firstLogin,
    firstName: user.firstName,
    lastName: user.lastName
  };

  return res.json({ message: 'Login successful' });
});

router.post('/api/users/logout', requireAuth, async (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(302).json({ error: 'Redirect to /signin.html' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// POST /api/users/me/profile-picture — updates current user's profile picture
router.post('/api/users/me/profile-picture', requireAuth, upload.single('profile-picture'), async (req, res) => {
  try {
    if (!req.file){ 
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!/image\/(png|jpe?g|webp)$/i.test(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only PNG/JPG/WEBP images allowed' });
    }
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File too large (max 5 MB)' });
    }

    const userId = String(req.session.user.userId); // from session
    const userDir = path.join(uploadsRoot, 'profile-pictures', userId);
    await fs.promises.mkdir(userDir, { recursive: true });

    const outPath = path.join(userDir, 'profile-picture.webp');
    await sharp(req.file.buffer)
      .rotate()                                // respect EXIF
      .resize(512, 512, { fit: 'cover' })      // square
      .webp({ quality: 90 })
      .toFile(outPath);

    const url = `/uploads/profile-pictures/${userId}/profile-picture.webp?v=${Date.now()}`;
    
    await updateProfilePictureUrl(url,req.session.user.userId);

    return res.json({ message: 'Upload successful!', url });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }

  return res.json({message: "Upload successful!"});
});

export default router;