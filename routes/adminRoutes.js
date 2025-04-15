const express = require('express');
const router = express.Router();
const { 
  registerAdmin, 
  loginAdmin, 
  getAdmin 
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', protect, getAdmin);

module.exports = router;