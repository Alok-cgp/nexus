const express = require('express');
const router = express.Router();
const { 
    loginUser, 
    registerUser, 
    setupMFA, 
    verifyMFA, 
    updatePassword,
    getUsers,
    updateUserRole
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/register', registerUser); // Made public for "Create Account" functionality
router.post('/mfa/setup', protect, setupMFA);
router.post('/mfa/verify', protect, verifyMFA);
router.put('/password', protect, updatePassword);
router.get('/users', protect, authorize('Admin'), getUsers);
router.put('/users/:id/role', protect, authorize('Admin'), updateUserRole);

module.exports = router;
