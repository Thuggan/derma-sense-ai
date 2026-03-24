const express = require('express');
const { 
    registerUser, 
    loginUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    getAllUsers,
    updateUserAdminStatus,
    deleteUser,
    verifyOTP,
    resendOTP
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); // Import admin middleware

const router = express.Router();

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/user', authMiddleware, getUserProfile);

// User Profile
router.put('/user', authMiddleware, updateUserProfile);

// Password Reset Routes
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Admin Routes
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.put('/users/:id/admin', authMiddleware, adminMiddleware, updateUserAdminStatus);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;