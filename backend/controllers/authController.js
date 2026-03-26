const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

// Registration function
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    
    // Basic email formatting validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address structure' });
    }
    
    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            if (user.isVerified || user.isAdmin) {
                return res.status(400).json({ message: 'User already exists and is verified. Please log in.' });
            } else {
                // User exists but is not verified, so let's send them a new OTP instead of blocking them!
                const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                user.otp = newOtp;
                user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
                
                // If they provided a new password, optionally update it
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                user.name = name;
                
                await user.save();
                
                try {
                    await sendEmail({
                        email: user.email,
                        subject: 'DermaSense AI - Verify Your Email',
                        message: `You recently tried to register. Your new verification code is: ${newOtp}\n\nThis code will expire in 10 minutes.`
                    });
                } catch (error) {
                    console.error('Email error:', error);
                }

                return res.status(201).json({
                    message: 'Unverified account found! A fresh OTP has been sent to your email. Please verify.',
                    requiresOtp: true,
                    email: user.email
                });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpire,
            isVerified: false
        });

        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'DermaSense AI - Verify Your Email',
                message: `Thank you for registering. Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`
            });
        } catch (error) {
            console.error('Initial email error:', error);
        }

        res.status(201).json({
            message: 'Registration successful! An OTP has been sent to your email. Please verify to continue.',
            requiresOtp: true,
            email: user.email
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Login function
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if verified
        if (user.isVerified === false && user.otp) {
            return res.status(403).json({ message: 'Please verify your email address to login.', requiresOtp: true });
        }

        // Create token
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '24h' });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin || false,
                isDoctor: user.isDoctor || false,
                clinicId: user.clinicId || null
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
    
    const user = await User.findOne({ email });
    //login notification
    await createNotification(
  user._id, 
  'system', 
  'Login Successful', 
  `You logged in successfully at ${new Date().toLocaleString()}`
);
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        console.log('Fetching profile for user ID:', req.user.id);
        
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all users (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ name: 1 });
        res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ success: false, error: 'Server error fetching users' });
    }
};

// Update user admin status (Admin)
const updateUserAdminStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        let actingAdminName = 'an Admin';
        if (req.user && req.user.id) {
            const actingAdmin = await User.findById(req.user.id);
            if (actingAdmin) actingAdminName = actingAdmin.name;
        }

        if (user._id.toString() === req.user.id && req.body.isAdmin === false) {
            return res.status(400).json({ success: false, message: 'You cannot remove your own admin status' });
        }

        if (req.body.isAdmin === false && user.isAdmin === true) {
            await createNotification(user._id, 'system', 'Admin Access Removed', `Your admin access was removed by ${actingAdminName}.`);
        } else if (req.body.isAdmin === true && user.isAdmin === false) {
            await createNotification(user._id, 'system', 'Admin Access Granted', `You have been granted admin access by ${actingAdminName}.`);
        }

        if (req.body.isAdmin !== undefined) user.isAdmin = req.body.isAdmin;
        if (req.body.isDoctor !== undefined) user.isDoctor = req.body.isDoctor;
        if (req.body.clinicId !== undefined) user.clinicId = req.body.clinicId;

        await user.save();

        res.status(200).json({ success: true, message: 'User status updated', user: { id: user._id, name: user.name, isAdmin: user.isAdmin, isDoctor: user.isDoctor, clinicId: user.clinicId } });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ success: false, error: 'Server error updating user status' });
    }
};

// Delete user (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
        }

        await User.deleteOne({ _id: req.params.id });
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, error: 'Server error deleting user' });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: jwt.sign({ id: updatedUser._id }, 'your_jwt_secret', { expiresIn: '24h' })
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'DermaSense AI - Password Reset Request',
                message: `You requested a password reset. Please go to this link to reset your password: \n\n ${resetUrl}`
            });
            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password correctly reset' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otpExpire) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        // Create token
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '24h' });

        res.status(200).json({
            message: 'Email successfully verified',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin || false,
                isDoctor: user.isDoctor || false,
                clinicId: user.clinicId || null
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Server error verifying OTP' });
    }
};

// Resend OTP
const resendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'DermaSense AI - New Verification Code',
                message: `Your new verification code is: ${otp}\n\nThis code will expire in 10 minutes.`
            });
            res.status(200).json({ 
                message: 'A new OTP has been sent to your email.'
            });
        } catch (error) {
            console.error('Resend OTP error:', error);
            res.status(500).json({ error: 'Failed to send OTP email' });
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Server error resending OTP' });
    }
};

module.exports = {
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
};