const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');   
const sendSms = require('../utils/sendSms');

// Helper: Generate JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register new user
const register = asyncHandler(async (req, res) => {
    try {
        console.log('[REGISTER BODY]:', req.body); // Log incoming request body

        const { name, email, password, role, studentId, faculty, course, yearOfStudy, gender, phone } = req.body;

        if (!name || !email || !password) {
            console.log('[REGISTER ERROR]: Missing required fields');
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('[REGISTER ERROR]: User already exists with this email');
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            studentId,
            faculty,
            course,
            yearOfStudy,
            gender,
            phone // Make sure phone is saved
        });

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        newUser.verificationToken = verificationToken;
        newUser.verificationTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
        await newUser.save();

        // Send verification email
        const verifyUrl = `http://localhost:5173/verify/${verificationToken}`;
        const html = `
            <h2>Verify Your Email</h2>
            <p>Hello ${newUser.name},</p>
            <p>Click the link below to verify your email:</p>
            <a href="${verifyUrl}" target="_blank">Verify Email</a>
        `;

        await sendEmail({ to: newUser.email, subject: 'Verify your email', html });

        // --- SEND SMS NOTIFICATION ---
        if (newUser.phone) {
            const smsResult = await sendSms(
                newUser.phone,
                `Welcome to the Kyambogo University Voting System, ${newUser.name}! Your registration was successful.`
            );
            if (smsResult) {
                console.log('[REGISTER]: Welcome SMS sent to:', newUser.phone);
            } else {
                console.log('[REGISTER]: Failed to send welcome SMS to:', newUser.phone);
            }
        }

        console.log('[REGISTER]: User registered & verification email sent to:', newUser.email);

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.',
            token: generateToken(newUser._id),
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.isVerified
            }
        });
    } catch (error) {
        console.error('[REGISTER ERROR]:', error.message, error);
        res.status(500).json({ message: 'Server error during registration', error: error.message, errorObj: error });
    }
});

// @desc    Login user
const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        user.lastLogin = new Date();
        await user.save();

        console.log('[LOGIN]: User logged in:', user.email);

        res.json({
            message: 'Login successful',
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('[LOGIN ERROR]:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @desc    Logout user
const logout = asyncHandler(async (req, res) => {
    try {
        console.log('[LOGOUT]: User logged out');
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('[LOGOUT ERROR]:', error.message);
        res.status(500).json({ message: 'Server error during logout' });
    }
});

// @desc    Verify email
const verifyEmail = asyncHandler(async (req, res) => {
    try {
        console.log('[VERIFY] Token received:', req.params.token);
        const user = await User.findOne({
            verificationToken: req.params.token,
            verificationTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            console.log('[VERIFY] No user found or token expired');
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        await user.save();

        console.log('[VERIFY]: Email verified for:', user.email);
        res.json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error('[VERIFY ERROR]:', error.message);
        res.status(500).json({ message: 'Error verifying email' });
    }
});
// @desc    Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 mins
        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${token}`;
        const html = `
            <h2>Reset Your Password</h2>
            <p>Hello ${user.name},</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" target="_blank">Reset Password</a>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            html
        });

        console.log('[FORGOT PASSWORD]: Token sent to', user.email);
        res.json({ message: 'Reset token sent to your email.' });
    } catch (error) {
        console.error('[FORGOT PASSWORD ERROR]:', error.message);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
});

// @desc    Reset password
const resetPassword = asyncHandler(async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();

        console.log('[RESET PASSWORD]: Password updated for:', user.email);
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('[RESET PASSWORD ERROR]:', error.message);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// @desc    Get profile
const getProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        console.log('[GET PROFILE]:', user.email);
        res.json({ message: 'Profile fetched', user });
    } catch (error) {
        console.error('[GET PROFILE ERROR]:', error.message);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// @desc    Update profile
const updateProfile = asyncHandler(async (req, res) => {
    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');

        console.log('[UPDATE PROFILE]:', user.email);
        res.json({ message: 'Profile updated', user });
    } catch (error) {
        console.error('[UPDATE PROFILE ERROR]:', error.message);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// @desc    Change password
const changePassword = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');
        const { currentPassword, newPassword } = req.body;

        if (!await bcrypt.compare(currentPassword, user.password)) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        console.log('[CHANGE PASSWORD]: Password changed for', user.email);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('[CHANGE PASSWORD ERROR]:', error.message);
        res.status(500).json({ message: 'Error changing password' });
    }
});

module.exports = {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword
};
