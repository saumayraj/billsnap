const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Create new user
        user = new User({ name, email, password });
        await user.save();
        
        // Create JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '7d'
        });
        
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Create JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '7d'
        });
        
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
    try {
        const { name, theme, emailNotifications } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, theme, emailNotifications },
            { new: true }
        ).select('-password');
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
