const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isDoctor: { type: Boolean, default: false },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

module.exports = mongoose.model('User', UserSchema);