"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware_1.protect, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
    });
});
// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware_1.protect, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }
    try {
        const { name, email } = req.body;
        // Update user fields
        if (name)
            req.user.name = name;
        if (email)
            req.user.email = email;
        const updatedUser = await req.user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            createdAt: updatedUser.createdAt,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
