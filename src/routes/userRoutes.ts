import express, { Response } from 'express';
import { protect } from '../middleware/authMiddleware';

// Define the interface for the authenticated request
interface AuthRequest extends express.Request {
    user?: any;
}

const router = express.Router();

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, (req: AuthRequest, res: Response) => {
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

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    try {
        const { name, email } = req.body;

        // Update user fields
        if (name) req.user.name = name;
        if (email) req.user.email = email;

        const updatedUser = await req.user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            createdAt: updatedUser.createdAt,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
