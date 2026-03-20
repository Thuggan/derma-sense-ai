const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
    try {
        // Authenticated user ID should be in req.user from authMiddleware
        const user = await User.findById(req.user.id);
        
        if (!user || user.isAdmin !== true) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin privileges required'
            });
        }
        
        next();
    } catch (err) {
        console.error('Admin middleware error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error verifying admin status'
        });
    }
};

module.exports = adminMiddleware;
