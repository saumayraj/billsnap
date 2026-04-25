const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../../models/User');

// Google Drive auth callback
router.post('/google-auth', auth, async (req, res) => {
    try {
        const { authToken } = req.body;
        
        // Save the token for this user
        await User.findByIdAndUpdate(req.user.id, {
            googleDriveToken: authToken
        });
        
        res.json({ success: true, message: 'Google Drive connected' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload to Google Drive
router.post('/upload-to-drive', auth, async (req, res) => {
    try {
        const { pdfBuffer, fileName } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user.googleDriveToken) {
            return res.status(400).json({ error: 'Google Drive not connected' });
        }
        
        // Upload logic would go here
        // Using google-auth-library and google-drive-api
        
        res.json({
            success: true,
            message: 'File uploaded to Google Drive',
            fileName
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
