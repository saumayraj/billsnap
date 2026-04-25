const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { performOCR } = require('../utils/ocr');

// Perform OCR on image
router.post('/extract', auth, async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ error: 'Image data required' });
        }
        
        const extractedData = await performOCR(imageData);
        
        res.json(extractedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
