const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const logActivity = require('../utils/logger');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password, token, requiredRole } = req.body;
        console.log(`Login attempt - Email: [${email}], Role Requirement: [${requiredRole || 'None'}]`);

        if (!email || !password) {
            console.log('Login attempt missing email or password');
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Case-insensitive email lookup in appropriate collection
        let user;
        if (requiredRole === 'Admin') {
            user = await Admin.findOne({ 
                email: { $regex: new RegExp(`^${email}$`, 'i') } 
            }).select('+password +mfaSecret');
        } else {
            user = await User.findOne({ 
                email: { $regex: new RegExp(`^${email}$`, 'i') } 
            }).select('+password +mfaSecret');
        }

        if (!user) {
            console.log(`User not found in ${requiredRole || 'User'} collection for email: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Role-specific check if requiredRole is provided
        if (requiredRole === 'Admin' && user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Access denied: Admin role required for this portal' });
        }
        if (requiredRole === 'User' && user.role === 'Admin') {
            return res.status(403).json({ success: false, message: 'Access denied: Admins must use the Admin portal' });
        }

        const isMatch = await user.comparePassword(password);
        console.log(`Password match for ${email}: ${isMatch}`);

        if (isMatch) {
            if (user.isMfaEnabled) {
                if (!token) {
                    await logActivity(user._id, 'LOGIN_MFA_REQUESTED', 'Auth', 'Success', req.ip);
                    return res.status(200).json({ 
                        success: true,
                        mfaRequired: true, 
                        userId: user._id 
                    });
                }

                const verified = speakeasy.totp.verify({
                    secret: user.mfaSecret,
                    encoding: 'base32',
                    token
                });

                if (!verified) {
                    await logActivity(user._id, 'LOGIN_MFA_FAILURE', 'Auth', 'Failure', req.ip, 'Invalid MFA token');
                    return res.status(401).json({ success: false, message: 'Invalid MFA token' });
                }
            }

            await logActivity(user._id, 'LOGIN_SUCCESS', 'Auth', 'Success', req.ip);
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isMfaEnabled: user.isMfaEnabled,
                token: generateToken(user._id),
            });
        } else {
            await logActivity(user._id, 'LOGIN_FAILURE', 'Auth', 'Failure', req.ip, 'Invalid password');
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check both collections for existing user
        const userExists = await User.findOne({ email });
        const adminExists = await Admin.findOne({ email });

        if (userExists || adminExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Developer'
        });

        // Log registration activity
        await logActivity(user._id, 'USER_REGISTERED', 'Auth', 'Success', req.ip);

        res.status(201).json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Setup MFA
// @route   POST /api/auth/mfa/setup
// @access  Private
const setupMFA = async (req, res, next) => {
    try {
        const user = req.user;
        
        const secret = speakeasy.generateSecret({
            name: `PixelForge Nexus (${user.email})`
        });

        user.mfaSecret = secret.base32;
        await user.save();

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        res.json({
            success: true,
            qrCodeUrl: qrCodeUrl,
            secret: secret.base32
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify and enable MFA
// @route   POST /api/auth/mfa/verify
// @access  Private
const verifyMFA = async (req, res, next) => {
    try {
        const { token } = req.body;
        // Re-fetch user to get mfaSecret which is not selected by default
        let user;
        if (req.user.role === 'Admin') {
            user = await Admin.findById(req.user._id).select('+mfaSecret');
        } else {
            user = await User.findById(req.user._id).select('+mfaSecret');
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token
        });

        if (verified) {
            user.isMfaEnabled = true;
            await user.save();
            await logActivity(user._id, 'MFA_ENABLED', 'Auth', 'Success', req.ip);
            res.json({ success: true, message: 'MFA enabled successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // Re-fetch user to get password which is not selected by default
        let user;
        if (req.user.role === 'Admin') {
            user = await Admin.findById(req.user._id).select('+password');
        } else {
            user = await User.findById(req.user._id).select('+password');
        }

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        const admins = await Admin.find({}).select('-password');
        res.json([...admins, ...users]);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        // Roles can only be updated for non-admin users
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or role cannot be changed' });
        }

        user.role = role;
        await user.save();

        res.json({ success: true, message: 'User role updated successfully', user });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = req.user;
        if (user) {
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isMfaEnabled: user.isMfaEnabled,
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginUser,
    registerUser,
    setupMFA,
    verifyMFA,
    updatePassword,
    getUsers,
    updateUserRole,
    getUserProfile
};
